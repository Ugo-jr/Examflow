"""Courses App Serializers"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Course, Enrollment

User = get_user_model()


class CourseSerializer(serializers.ModelSerializer):
    instructor_name = serializers.CharField(source='instructor.get_full_name', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    enrolled_count = serializers.IntegerField(read_only=True)
    is_enrolled = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'code', 'description', 'instructor', 'instructor_name',
            'department', 'department_name', 'thumbnail', 'is_active',
            'enrolled_count', 'is_enrolled', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'instructor']

    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.role == 'student':
            return obj.enrollments.filter(student=request.user, is_active=True).exists()
        return None


class EnrollmentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    student_email = serializers.EmailField(source='student.email', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)
    course_code = serializers.CharField(source='course.code', read_only=True)

    class Meta:
        model = Enrollment
        fields = '__all__'
        read_only_fields = ['id', 'enrolled_at']
