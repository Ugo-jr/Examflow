"""Results App Models"""
from django.db import models
from django.conf import settings


class Result(models.Model):
    attempt = models.OneToOneField('exams.ExamAttempt', on_delete=models.CASCADE, related_name='result')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='results')
    exam = models.ForeignKey('exams.Exam', on_delete=models.CASCADE, related_name='results')
    score = models.DecimalField(max_digits=8, decimal_places=2)
    percentage = models.DecimalField(max_digits=5, decimal_places=2)
    total_marks = models.PositiveIntegerField()
    passed = models.BooleanField()
    correct_answers = models.PositiveIntegerField(default=0)
    wrong_answers = models.PositiveIntegerField(default=0)
    unanswered = models.PositiveIntegerField(default=0)
    time_taken_seconds = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.student.get_full_name()} - {self.exam.title}: {self.percentage:.1f}%"

    @property
    def time_taken_formatted(self):
        mins, secs = divmod(self.time_taken_seconds, 60)
        return f"{mins}m {secs}s"
