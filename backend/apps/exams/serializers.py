"""Exams App Serializers"""
from rest_framework import serializers
from .models import Exam, Question, Option, ExamAttempt, StudentAnswer


class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ['id', 'text', 'order', 'is_correct']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Hide correct answer from students during exam
        request = self.context.get('request')
        if request and request.user.role == 'student':
            data.pop('is_correct', None)
        return data


class OptionStudentSerializer(serializers.ModelSerializer):
    """Option serializer for students - no correct answer revealed"""
    class Meta:
        model = Option
        fields = ['id', 'text', 'order']


class QuestionSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'text', 'question_type', 'marks', 'order', 'image', 'options', 'explanation']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        # Hide explanation during active exam
        if request and request.user.role == 'student' and self.context.get('during_exam'):
            data.pop('explanation', None)
        return data


class QuestionCreateSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True, required=False)
    image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Question
        fields = ['id', 'exam', 'text', 'question_type', 'marks', 'order', 'image', 'explanation', 'options']

    def to_internal_value(self, data):
        # Handle options sent as JSON string inside FormData
        if isinstance(data, dict) and 'options' in data and isinstance(data['options'], str):
            import json
            try:
                mutable = data.copy()
                mutable['options'] = json.loads(data['options'])
                data = mutable
            except Exception:
                pass
        return super().to_internal_value(data)

    def create(self, validated_data):
        options_data = validated_data.pop('options', [])
        question = Question.objects.create(**validated_data)
        for opt_data in options_data:
            Option.objects.create(question=question, **opt_data)
        return question

    def update(self, instance, validated_data):
        options_data = validated_data.pop('options', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if options_data is not None:
            instance.options.all().delete()
            for opt_data in options_data:
                Option.objects.create(question=instance, **opt_data)
        return instance

class ExamListSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)
    course_code = serializers.CharField(source='course.code', read_only=True)
    instructor_name = serializers.CharField(source='instructor.get_full_name', read_only=True)
    question_count = serializers.IntegerField(read_only=True)
    is_available = serializers.BooleanField(read_only=True)

    class Meta:
        model = Exam
        fields = [
            'id', 'title', 'description', 'course', 'course_title', 'course_code',
            'instructor_name', 'duration_minutes', 'passing_score', 'total_marks',
            'status', 'start_datetime', 'end_datetime', 'question_count', 'is_available',
            'created_at', 'updated_at'
        ]


class ExamDetailSerializer(ExamListSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta(ExamListSerializer.Meta):
        fields = ExamListSerializer.Meta.fields + [
            'instructions', 'shuffle_questions', 'shuffle_options',
            'show_results_immediately', 'max_attempts', 'questions'
        ]


class ExamCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exam
        fields = [
            'title', 'description', 'course', 'duration_minutes', 'passing_score',
            'total_marks', 'status', 'start_datetime', 'end_datetime', 'instructions',
            'shuffle_questions', 'shuffle_options', 'show_results_immediately', 'max_attempts'
        ]


class StudentAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentAnswer
        fields = ['id', 'question', 'selected_options', 'is_flagged', 'answered_at']


class ExamAttemptSerializer(serializers.ModelSerializer):
    exam_title = serializers.CharField(source='exam.title', read_only=True)
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    answers = StudentAnswerSerializer(many=True, read_only=True)

    class Meta:
        model = ExamAttempt
        fields = [
            'id', 'student', 'student_name', 'exam', 'exam_title',
            'status', 'started_at', 'submitted_at', 'time_taken_seconds', 'answers'
        ]
        read_only_fields = ['id', 'started_at']


class SaveAnswerSerializer(serializers.Serializer):
    """Used for auto-save and manual answer saving"""
    question_id = serializers.IntegerField()
    selected_option_ids = serializers.ListField(child=serializers.IntegerField(), allow_empty=True)
    is_flagged = serializers.BooleanField(default=False)
