from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('auth/smart/', views.SmartAuthView.as_view(), name='smart_auth'),
    path('auth/send-otp/', views.SendOTPView.as_view(), name='send_otp'),
    path('auth/verify-otp/', views.VerifyOTPView.as_view(), name='verify_otp'),
    path('auth/suggest-password/', views.SuggestPasswordView.as_view(), name='suggest_password'),
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('survey/', views.SurveyView.as_view(), name='survey'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change_password'),
    path('forgot-password/', views.ForgotPasswordView.as_view(), name='forgot_password'),
    path('reset-password/', views.ResetPasswordView.as_view(), name='reset_password'),
    path('admin/users/', views.AdminUserListView.as_view(), name='admin_users'),
    path('admin/stats/', views.AdminStatsView.as_view(), name='admin_stats'),
]
