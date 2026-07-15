from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CourseViewSet, EnrollmentViewSet

router = DefaultRouter()
router.register('', CourseViewSet, basename='courses')
router.register('enrollments', EnrollmentViewSet, basename='enrollments')

urlpatterns = [path('', include(router.urls))]
