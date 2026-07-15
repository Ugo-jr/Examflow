from django.urls import path
from .analytics import AdminAnalyticsView, InstructorAnalyticsView

urlpatterns = [
    path('admin/', AdminAnalyticsView.as_view(), name='admin_analytics'),
    path('instructor/', InstructorAnalyticsView.as_view(), name='instructor_analytics'),
]
