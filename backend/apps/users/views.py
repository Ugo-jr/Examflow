from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters

from .models import Department
from .serializers import (
    UserRegistrationSerializer, UserSerializer, UserUpdateSerializer,
    ChangePasswordSerializer, CustomTokenObtainPairSerializer,
    DepartmentSerializer, ProfilePictureSerializer
)
from .permissions import IsAdminUser, IsOwnerOrAdmin

User = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)

        # Send welcome email (non-blocking)
        try:
            from django.core.mail import send_mail
            from django.conf import settings
            send_mail(
                subject='Welcome to ExamFlow!',
                message=f'Hi {user.first_name},\n\nWelcome to ExamFlow! Your account has been created successfully.\n\nYou can now log in and start using the platform.\n\nBest regards,\nThe ExamFlow Team',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True,
            )
        except Exception:
            pass

        return Response({
            'user': UserSerializer(user, context={'request': request}).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'email_sent': True,
        }, status=status.HTTP_201_CREATED)


class LogoutView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'detail': 'Successfully logged out.'})
        except Exception:
            return Response({'detail': 'Invalid token.'}, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserUpdateSerializer
        return UserSerializer

    def get_object(self):
        return self.request.user

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class UploadProfilePictureView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    serializer_class = ProfilePictureSerializer

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        # Delete old picture if exists
        if user.profile_picture:
            try:
                import os
                if os.path.isfile(user.profile_picture.path):
                    os.remove(user.profile_picture.path)
            except Exception:
                pass

        serializer = self.get_serializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({
            'profile_picture_url': request.build_absolute_uri(user.profile_picture.url)
            if user.profile_picture else None
        })


class RemoveProfilePictureView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user = request.user
        if user.profile_picture:
            try:
                import os
                if os.path.isfile(user.profile_picture.path):
                    os.remove(user.profile_picture.path)
            except Exception:
                pass
            user.profile_picture = None
            user.save()
        return Response({'detail': 'Profile picture removed.'})


class ChangePasswordView(generics.UpdateAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        return Response({'detail': 'Password changed successfully.'})


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['role', 'department', 'is_active']
    search_fields = ['email', 'first_name', 'last_name', 'student_id']
    ordering_fields = ['date_joined', 'last_name', 'email']

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()
        return Response({'is_active': user.is_active})

    @action(detail=False, methods=['get'])
    def stats(self, request):
        return Response({
            'total': User.objects.count(),
            'students': User.objects.filter(role='student').count(),
            'instructors': User.objects.filter(role='instructor').count(),
            'admins': User.objects.filter(role='admin').count(),
            'active': User.objects.filter(is_active=True).count(),
        })


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'code']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [IsAuthenticated()]