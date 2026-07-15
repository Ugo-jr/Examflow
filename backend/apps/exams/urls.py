from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExamViewSet, QuestionViewSet

router = DefaultRouter()
router.register('questions', QuestionViewSet, basename='questions')
router.register('', ExamViewSet, basename='exams')

urlpatterns = [path('', include(router.urls))]