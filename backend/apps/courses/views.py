"""Courses App Views"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import filters
from django_filters.rest_framework import DjangoFilterBackend

from .models import Course, Enrollment
from .serializers import CourseSerializer, EnrollmentSerializer
from apps.users.permissions import IsInstructorOrAdmin, IsAdminUser


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['department', 'instructor', 'is_active']
    search_fields = ['title', 'code', 'description']
    ordering_fields = ['created_at', 'title', 'code']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsInstructorOrAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'instructor':
            # Instructors see their own courses
            if self.action in ['update', 'partial_update', 'destroy']:
                return Course.objects.filter(instructor=user)
        return Course.objects.all()

    def perform_create(self, serializer):
        if self.request.user.role == 'instructor':
            serializer.save(instructor=self.request.user)
        else:
            serializer.save()

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def enroll(self, request, pk=None):
        course = self.get_object()
        if request.user.role != 'student':
            return Response({'detail': 'Only students can enroll.'}, status=400)
        enrollment, created = Enrollment.objects.get_or_create(
            student=request.user, course=course,
            defaults={'is_active': True}
        )
        if not created:
            enrollment.is_active = True
            enrollment.save()
        return Response({'detail': 'Enrolled successfully.'})

    @action(detail=True, methods=['get'], permission_classes=[IsInstructorOrAdmin])
    def students(self, request, pk=None):
        course = self.get_object()
        enrollments = course.enrollments.filter(is_active=True).select_related('student')
        serializer = EnrollmentSerializer(enrollments, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_courses(self, request):
        user = request.user
        if user.role == 'student':
            courses = Course.objects.filter(enrollments__student=user, enrollments__is_active=True)
        elif user.role == 'instructor':
            courses = Course.objects.filter(instructor=user)
        else:
            courses = Course.objects.all()
        serializer = self.get_serializer(courses, many=True)
        return Response(serializer.data)


class EnrollmentViewSet(viewsets.ModelViewSet):
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['student', 'course', 'is_active']
