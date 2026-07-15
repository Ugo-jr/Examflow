"""Results App Serializers"""
from rest_framework import serializers
from .models import Result
from apps.exams.models import StudentAnswer, Option


class ResultSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    student_email = serializers.EmailField(source='student.email', read_only=True)
    exam_title = serializers.CharField(source='exam.title', read_only=True)
    course_title = serializers.CharField(source='exam.course.title', read_only=True)
    time_taken_formatted = serializers.CharField(read_only=True)

    class Meta:
        model = Result
        fields = [
            'id', 'student', 'student_name', 'student_email', 'exam', 'exam_title',
            'course_title', 'score', 'percentage', 'total_marks', 'passed',
            'correct_answers', 'wrong_answers', 'unanswered',
            'time_taken_seconds', 'time_taken_formatted', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class AnswerReviewSerializer(serializers.ModelSerializer):
    """Detailed answer review after exam"""
    question_text = serializers.CharField(source='question.text', read_only=True)
    question_type = serializers.CharField(source='question.question_type', read_only=True)
    marks = serializers.IntegerField(source='question.marks', read_only=True)
    explanation = serializers.CharField(source='question.explanation', read_only=True)
    all_options = serializers.SerializerMethodField()
    is_correct = serializers.SerializerMethodField()

    class Meta:
        model = StudentAnswer
        fields = [
            'id', 'question', 'question_text', 'question_type', 'marks',
            'explanation', 'selected_options', 'all_options', 'is_correct', 'is_flagged'
        ]

    def get_all_options(self, obj):
        return [{
            'id': opt.id,
            'text': opt.text,
            'is_correct': opt.is_correct,
            'was_selected': opt.id in [s.id for s in obj.selected_options.all()]
        } for opt in obj.question.options.all()]

    def get_is_correct(self, obj):
        selected_ids = set(obj.selected_options.values_list('id', flat=True))
        correct_ids = set(obj.question.options.filter(is_correct=True).values_list('id', flat=True))
        return selected_ids == correct_ids and bool(selected_ids)
