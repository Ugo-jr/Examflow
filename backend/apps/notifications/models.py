"""Notifications App Models"""
from django.db import models
from django.conf import settings


class Notification(models.Model):
    class Type(models.TextChoices):
        EXAM = 'exam', 'Exam'
        RESULT = 'result', 'Result'
        COURSE = 'course', 'Course'
        SYSTEM = 'system', 'System'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=Type.choices, default=Type.SYSTEM)
    related_exam = models.ForeignKey('exams.Exam', on_delete=models.SET_NULL, null=True, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email}: {self.title}"
