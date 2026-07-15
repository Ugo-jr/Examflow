from django.db import models
from django.conf import settings
from django.utils import timezone


class Exam(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        PUBLISHED = 'published', 'Published'
        CLOSED = 'closed', 'Closed'

    title = models.CharField(max_length=300)
    description = models.TextField(blank=True)
    course = models.ForeignKey(
        'courses.Course', on_delete=models.CASCADE, related_name='exams'
    )
    instructor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='exams_created',
        limit_choices_to={'role': 'instructor'}
    )
    duration_minutes = models.PositiveIntegerField(default=60)
    passing_score = models.DecimalField(max_digits=5, decimal_places=2, default=50.00)
    total_marks = models.PositiveIntegerField(default=100)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    start_datetime = models.DateTimeField(null=True, blank=True)
    end_datetime = models.DateTimeField(null=True, blank=True)
    instructions = models.TextField(blank=True)
    shuffle_questions = models.BooleanField(default=False)
    shuffle_options = models.BooleanField(default=False)
    show_results_immediately = models.BooleanField(default=True)
    max_attempts = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.course.code})"

    @property
    def is_available(self):
        now = timezone.now()
        if self.status != self.Status.PUBLISHED:
            return False
        if self.end_datetime and now > self.end_datetime:
            return False
        return True

    @property
    def question_count(self):
        return self.questions.count()


class Question(models.Model):
    class QuestionType(models.TextChoices):
        MCQ = 'mcq', 'Multiple Choice'
        TRUE_FALSE = 'true_false', 'True/False'
        MULTI_SELECT = 'multi_select', 'Multi-Select'

    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField()
    question_type = models.CharField(max_length=20, choices=QuestionType.choices, default=QuestionType.MCQ)
    marks = models.PositiveIntegerField(default=1)
    explanation = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    image = models.ImageField(upload_to='question_images/', blank=True, null=True)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"Q{self.order}: {self.text[:80]}"


class Option(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='options')
    text = models.CharField(max_length=500)
    is_correct = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{'correct' if self.is_correct else 'wrong'}: {self.text[:60]}"


class ExamAttempt(models.Model):
    class Status(models.TextChoices):
        IN_PROGRESS = 'in_progress', 'In Progress'
        SUBMITTED = 'submitted', 'Submitted'
        TIMED_OUT = 'timed_out', 'Timed Out'

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='exam_attempts'
    )
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='attempts')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.IN_PROGRESS)
    started_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    time_taken_seconds = models.PositiveIntegerField(null=True, blank=True)

    class Meta:
        ordering = ['-started_at']

    def __str__(self):
        return f"{self.student.get_full_name()} - {self.exam.title}"


class StudentAnswer(models.Model):
    attempt = models.ForeignKey(ExamAttempt, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='student_answers')
    selected_options = models.ManyToManyField(Option, blank=True)
    is_flagged = models.BooleanField(default=False)
    answered_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['attempt', 'question']

    def __str__(self):
        return f"Answer: {self.question.text[:50]}"