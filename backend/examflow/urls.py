"""ExamFlow URL Configuration"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.users.urls.auth_urls')),
    path('api/users/', include('apps.users.urls.user_urls')),
    path('api/courses/', include('apps.courses.urls')),
    path('api/exams/', include('apps.exams.urls')),
    path('api/results/', include('apps.results.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/analytics/', include('apps.results.analytics_urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
