from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from apps.users.views import (
    CustomTokenObtainPairView, RegisterView, LogoutView,
    ProfileView, ChangePasswordView, UploadProfilePictureView,
    RemoveProfilePictureView
)

urlpatterns = [
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('register/', RegisterView.as_view(), name='register'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('profile/picture/', UploadProfilePictureView.as_view(), name='upload_picture'),
    path('profile/picture/remove/', RemoveProfilePictureView.as_view(), name='remove_picture'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
]