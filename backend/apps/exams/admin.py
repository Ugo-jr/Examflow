from django.contrib import admin
from .models import Exam, Question, Option, ExamAttempt, StudentAnswer

admin.site.register(Exam)
admin.site.register(Question)
admin.site.register(Option)
admin.site.register(ExamAttempt)
admin.site.register(StudentAnswer)