"""Courses App Models"""
from django.db import models
from django.conf import settings


class Course(models.Model):
    title = models.CharField(max_length=300)
    code = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    instructor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='courses_taught',
        limit_choices_to={'role': 'instructor'}
    )
    department = models.ForeignKey(
        'users.Department',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='courses'
    )
    thumbnail = models.ImageField(upload_to='course_thumbnails/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.code} - {self.title}"

    @property
    def enrolled_count(self):
        return self.enrollments.filter(is_active=True).count()


class Enrollment(models.Model):
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='enrollments',
        limit_choices_to={'role': 'student'}
    )
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ['student', 'course']
        ordering = ['-enrolled_at']

    def __str__(self):
        return f"{self.student.get_full_name()} → {self.course.code}"
