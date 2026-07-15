"""Results App Views"""
import io
import openpyxl
from django.http import HttpResponse
from django.db.models import Avg, Count, Max, Min
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters

from .models import Result
from .serializers import ResultSerializer, AnswerReviewSerializer
from apps.exams.models import StudentAnswer, ExamAttempt
from apps.users.permissions import IsInstructorOrAdmin


class ResultViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Result.objects.all()
    serializer_class = ResultSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['exam', 'student', 'passed']
    search_fields = ['student__first_name', 'student__last_name', 'exam__title']
    ordering_fields = ['created_at', 'percentage', 'score']

    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            return Result.objects.filter(student=user)
        if user.role == 'instructor':
            return Result.objects.filter(exam__instructor=user)
        return Result.objects.all()

    @action(detail=True, methods=['get'])
    def review(self, request, pk=None):
        """Return detailed answer review"""
        result = self.get_object()
        if request.user.role == 'student' and result.student != request.user:
            return Response({'detail': 'Not authorized.'}, status=403)
        answers = result.attempt.answers.prefetch_related('selected_options', 'question__options').all()
        serializer = AnswerReviewSerializer(answers, many=True)
        return Response({
            'result': ResultSerializer(result).data,
            'answers': serializer.data,
        })

    @action(detail=False, methods=['get'], permission_classes=[IsInstructorOrAdmin])
    def export_excel(self, request):
        """Export results as Excel"""
        exam_id = request.query_params.get('exam_id')
        results = Result.objects.filter(exam_id=exam_id).select_related('student', 'exam') if exam_id else Result.objects.all()

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = 'Results'
        headers = ['Student Name', 'Email', 'Exam', 'Score', 'Percentage', 'Passed', 'Correct', 'Wrong', 'Time Taken', 'Date']
        ws.append(headers)
        for result in results:
            ws.append([
                result.student.get_full_name(),
                result.student.email,
                result.exam.title,
                float(result.score),
                float(result.percentage),
                'Yes' if result.passed else 'No',
                result.correct_answers,
                result.wrong_answers,
                result.time_taken_formatted,
                result.created_at.strftime('%Y-%m-%d %H:%M'),
            ])

        output = io.BytesIO()
        wb.save(output)
        output.seek(0)
        response = HttpResponse(output.read(), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="results.xlsx"'
        return response

    @action(detail=False, methods=['get'], permission_classes=[IsInstructorOrAdmin])
    def export_pdf(self, request):
        """Export results as PDF"""
        exam_id = request.query_params.get('exam_id')
        results = Result.objects.filter(exam_id=exam_id).select_related('student', 'exam') if exam_id else Result.objects.all()

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        elements = [Paragraph("Exam Results Report", styles['Title'])]
        data = [['Student', 'Exam', 'Score', '%', 'Passed', 'Date']]
        for r in results:
            data.append([
                r.student.get_full_name(),
                r.exam.title[:30],
                str(r.score),
                f'{r.percentage:.1f}%',
                'Yes' if r.passed else 'No',
                r.created_at.strftime('%Y-%m-%d'),
            ])
        table = Table(data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4F46E5')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F3F4F6')]),
        ]))
        elements.append(table)
        doc.build(elements)
        buffer.seek(0)
        response = HttpResponse(buffer.read(), content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="results.pdf"'
        return response
