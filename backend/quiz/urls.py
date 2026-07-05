from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'questions', views.QuestionViewSet, basename='question')

urlpatterns = [
    path('', include(router.urls)),
    path('quiz/start/', views.QuizStartView.as_view(), name='quiz_start'),
    path('quiz/submit/', views.QuizSubmitView.as_view(), name='quiz_submit'),
    path('quiz/history/', views.QuizHistoryView.as_view(), name='quiz_history'),
    path('quiz/review/<int:pk>/', views.QuizReviewView.as_view(), name='quiz_review'),
    path('tips/', views.DailyTipsView.as_view(), name='daily_tips'),
    path('news/', views.CyberNewsView.as_view(), name='cyber_news'),
]
