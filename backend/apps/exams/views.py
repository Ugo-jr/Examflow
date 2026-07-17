import json
import random
from django.utils import timezone
from django.db import transaction
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework import filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Exam, Question, Option, ExamAttempt, StudentAnswer
from .serializers import ExamListSerializer, ExamDetailSerializer, ExamCreateSerializer, QuestionSerializer, ExamAttemptSerializer, SaveAnswerSerializer
from apps.users.permissions import IsInstructorOrAdmin
from apps.results.models import Result
from apps.notifications.models import Notification


class ExamViewSet(viewsets.ModelViewSet):
    queryset = Exam.objects.all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['course', 'status', 'instructor']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'title']

    def get_serializer_class(self):
        if self.action == 'list':
            return ExamListSerializer
        if self.action in ['create', 'update', 'partial_update']:
            return ExamCreateSerializer
        return ExamDetailSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'publish', 'close']:
            return [IsInstructorOrAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            return Exam.objects.filter(status='published')
        if user.role == 'instructor':
            return Exam.objects.filter(instructor=user)
        return Exam.objects.all()

    def perform_create(self, serializer):
        if self.request.user.role == 'instructor':
            serializer.save(instructor=self.request.user)
        else:
            serializer.save()

    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        exam = self.get_object()
        if exam.questions.count() == 0:
            return Response({'detail': 'Cannot publish exam with no questions.'}, status=400)
        exam.status = Exam.Status.PUBLISHED
        exam.save()
        enrolled_students = exam.course.enrollments.filter(is_active=True).values_list('student', flat=True)
        notifications = [Notification(user_id=sid, title=f'New Exam: {exam.title}', message=f'A new exam has been published for {exam.course.title}.', notification_type='exam', related_exam=exam) for sid in enrolled_students]
        Notification.objects.bulk_create(notifications)
        return Response({'detail': 'Exam published.', 'status': exam.status})

    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        exam = self.get_object()
        exam.status = Exam.Status.CLOSED
        exam.save()
        return Response({'detail': 'Exam closed.', 'status': exam.status})

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def start(self, request, pk=None):
        exam = self.get_object()
        user = request.user
        if user.role != 'student':
            return Response({'detail': 'Only students can start exams.'}, status=403)
        if not exam.is_available:
            return Response({'detail': 'This exam is not currently available.'}, status=400)
        attempt_count = ExamAttempt.objects.filter(student=user, exam=exam, status='submitted').count()
        if attempt_count >= exam.max_attempts:
            return Response({'detail': 'Maximum attempts reached.'}, status=400)
        active = ExamAttempt.objects.filter(student=user, exam=exam, status='in_progress').first()
        if active:
            exam_data = ExamDetailSerializer(exam, context={'request': request, 'during_exam': True}).data
            return Response({'attempt_id': active.id, 'exam': exam_data, 'started_at': active.started_at, 'resumed': True}, status=200)
        with transaction.atomic():
            attempt = ExamAttempt.objects.create(student=user, exam=exam)
        exam_data = ExamDetailSerializer(exam, context={'request': request, 'during_exam': True}).data
        return Response({'attempt_id': attempt.id, 'exam': exam_data, 'started_at': attempt.started_at, 'resumed': False}, status=200)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def save_answer(self, request, pk=None):
        attempt_id = request.data.get('attempt_id')
        try:
            attempt = ExamAttempt.objects.get(id=attempt_id, student=request.user, exam_id=pk)
        except ExamAttempt.DoesNotExist:
            return Response({'detail': 'Invalid attempt.'}, status=400)
        if attempt.status != 'in_progress':
            return Response({'detail': 'Attempt already submitted.'}, status=400)
        serializer = SaveAnswerSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        question = Question.objects.get(id=data['question_id'], exam_id=pk)
        answer, _ = StudentAnswer.objects.get_or_create(attempt=attempt, question=question)
        answer.is_flagged = data['is_flagged']
        answer.save()
        answer.selected_options.set(data['selected_option_ids'])
        return Response({'detail': 'Answer saved.'})

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def submit(self, request, pk=None):
        attempt_id = request.data.get('attempt_id')
        try:
            attempt = ExamAttempt.objects.get(id=attempt_id, student=request.user, exam_id=pk)
        except ExamAttempt.DoesNotExist:
            return Response({'detail': 'Invalid attempt.'}, status=400)
        if attempt.status != 'in_progress':
            return Response({'detail': 'Attempt already submitted.'}, status=400)
        result = self._grade_attempt(attempt)
        return Response({'result_id': result.id, 'score': result.score, 'passed': result.passed})

    def _grade_attempt(self, attempt):
        exam = attempt.exam
        questions = exam.questions.prefetch_related('options').all()
        earned_marks = 0
        correct_count = 0
        wrong_count = 0
        unanswered = 0
        for question in questions:
            try:
                answer = attempt.answers.get(question=question)
                selected_ids = set(answer.selected_options.values_list('id', flat=True))
                correct_ids = set(question.options.filter(is_correct=True).values_list('id', flat=True))
                if selected_ids == correct_ids and selected_ids:
                    earned_marks += question.marks
                    correct_count += 1
                elif selected_ids:
                    wrong_count += 1
                else:
                    unanswered += 1
            except StudentAnswer.DoesNotExist:
                unanswered += 1
        now = timezone.now()
        time_taken = int((now - attempt.started_at).total_seconds())
        attempt.status = ExamAttempt.Status.SUBMITTED
        attempt.submitted_at = now
        attempt.time_taken_seconds = time_taken
        attempt.save()
        score_pct = (earned_marks / exam.total_marks * 100) if exam.total_marks else 0
        passed = score_pct >= float(exam.passing_score)
        result = Result.objects.create(attempt=attempt, student=attempt.student, exam=exam, score=earned_marks, percentage=score_pct, total_marks=exam.total_marks, passed=passed, correct_answers=correct_count, wrong_answers=wrong_count, unanswered=unanswered, time_taken_seconds=time_taken)
        Notification.objects.create(user=attempt.student, title='Exam Submitted', message=f'Your exam "{exam.title}" has been graded. Score: {score_pct:.1f}%', notification_type='result', related_exam=exam)
        return result


class QuestionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['exam']
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        return QuestionSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'instructor':
            return Question.objects.filter(exam__instructor=user).prefetch_related('options')
        return Question.objects.all().prefetch_related('options')

    def create(self, request, *args, **kwargs):
        options_raw = request.data.get('options', '[]')
        if isinstance(options_raw, str):
            try:
                options_list = json.loads(options_raw)
            except Exception:
                options_list = []
        else:
            options_list = list(options_raw) if options_raw else []
        question = Question.objects.create(exam_id=request.data.get('exam'), text=request.data.get('text', ''), question_type=request.data.get('question_type', 'mcq'), marks=int(request.data.get('marks', 1)), explanation=request.data.get('explanation', ''), order=int(request.data.get('order', 0)))
        if 'image' in request.FILES:
            question.image = request.FILES['image']
            question.save()
        for i, opt in enumerate(options_list):
            text = opt.get('text', '').strip()
            if text:
                Option.objects.create(question=question, text=text, is_correct=bool(opt.get('is_correct', False)), order=int(opt.get('order', i)))
        print(f'Created question {question.id} with {question.options.count()} options')
        serializer = QuestionSerializer(question)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        options_raw = request.data.get('options', None)
        if options_raw is not None:
            if isinstance(options_raw, str):
                try:
                    options_list = json.loads(options_raw)
                except Exception:
                    options_list = []
            else:
                options_list = list(options_raw) if options_raw else []
        else:
            options_list = None
        if 'text' in request.data:
            instance.text = request.data['text']
        if 'question_type' in request.data:
            instance.question_type = request.data['question_type']
        if 'marks' in request.data:
            instance.marks = int(request.data['marks'])
        if 'explanation' in request.data:
            instance.explanation = request.data['explanation']
        if 'image' in request.FILES:
            instance.image = request.FILES['image']
        instance.save()
        if options_list is not None:
            instance.options.all().delete()
            for i, opt in enumerate(options_list):
                text = opt.get('text', '').strip()
                if text:
                    Option.objects.create(question=instance, text=text, is_correct=bool(opt.get('is_correct', False)), order=int(opt.get('order', i)))
        print(f'Updated question {instance.id} with {instance.options.count()} options')
        serializer = QuestionSerializer(instance)
        return Response(serializer.data)