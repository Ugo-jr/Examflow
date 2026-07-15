"""Analytics Views"""
from django.db.models import Avg, Count, Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.users.permissions import IsInstructorOrAdmin, IsAdminUser
from apps.users.models import User
from apps.courses.models import Course
from apps.exams.models import Exam
from apps.results.models import Result


class AdminAnalyticsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        return Response({
            'users': {
                'total': User.objects.count(),
                'students': User.objects.filter(role='student').count(),
                'instructors': User.objects.filter(role='instructor').count(),
            },
            'courses': Course.objects.filter(is_active=True).count(),
            'exams': {
                'total': Exam.objects.count(),
                'published': Exam.objects.filter(status='published').count(),
                'draft': Exam.objects.filter(status='draft').count(),
            },
            'results': {
                'total': Result.objects.count(),
                'passed': Result.objects.filter(passed=True).count(),
                'avg_score': Result.objects.aggregate(avg=Avg('percentage'))['avg'] or 0,
            }
        })


class InstructorAnalyticsView(APIView):
    permission_classes = [IsInstructorOrAdmin]

    def get(self, request):
        user = request.user
        my_exams = Exam.objects.filter(instructor=user) if user.role == 'instructor' else Exam.objects.all()
        my_results = Result.objects.filter(exam__in=my_exams)

        return Response({
            'total_students': User.objects.filter(role='student').count(),
            'total_courses': Course.objects.filter(instructor=user).count() if user.role == 'instructor' else Course.objects.count(),
            'total_exams': my_exams.count(),
            'avg_score': my_results.aggregate(avg=Avg('percentage'))['avg'] or 0,
            'pass_rate': (
                my_results.filter(passed=True).count() / my_results.count() * 100
                if my_results.count() > 0 else 0
            ),
            'recent_results': [
                {
                    'exam': r.exam.title,
                    'student': r.student.get_full_name(),
                    'score': float(r.percentage),
                    'passed': r.passed,
                    'date': r.created_at.strftime('%Y-%m-%d'),
                }
                for r in my_results.order_by('-created_at')[:10]
            ],
            'exam_stats': [
                {
                    'exam': exam.title,
                    'attempts': exam.results.count(),
                    'avg': exam.results.aggregate(avg=Avg('percentage'))['avg'] or 0,
                    'pass_rate': (
                        exam.results.filter(passed=True).count() / exam.results.count() * 100
                        if exam.results.count() > 0 else 0
                    ),
                }
                for exam in my_exams.annotate(result_count=Count('results')).filter(result_count__gt=0)[:5]
            ]
        })
