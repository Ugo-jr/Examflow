from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.users.views import UserViewSet, DepartmentViewSet

router = DefaultRouter()
router.register('', UserViewSet, basename='users')
router.register('departments', DepartmentViewSet, basename='departments')

urlpatterns = [
    path('', include(router.urls)),
]
