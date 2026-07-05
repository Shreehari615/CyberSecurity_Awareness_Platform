from django.contrib import admin
from .models import Question, QuizAttempt, UserAnswer


class UserAnswerInline(admin.TabularInline):
    """Inline display of user answers within a quiz attempt."""
    model = UserAnswer
    readonly_fields = ('question', 'selected_answer', 'correct_answer', 'is_correct')
    extra = 0
    can_delete = False


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    """Admin configuration for Question model."""
    list_display = ('id', 'short_text', 'category', 'difficulty', 'target_user_type', 'correct_answer', 'is_active', 'created_at')
    list_filter = ('category', 'difficulty', 'target_user_type', 'is_active')
    search_fields = ('question_text', 'option_a', 'option_b', 'option_c', 'option_d')
    list_editable = ('is_active',)
    ordering = ('-created_at',)

    def short_text(self, obj):
        return obj.question_text[:80] + '...' if len(obj.question_text) > 80 else obj.question_text
    short_text.short_description = 'Question'


@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    """Admin configuration for QuizAttempt model."""
    list_display = ('user', 'score', 'total_questions', 'percentage', 'quiz_type', 'created_at')
    list_filter = ('quiz_type', 'created_at')
    search_fields = ('user__email', 'user__full_name')
    readonly_fields = ('user', 'score', 'total_questions', 'phishing_score', 'phishing_total',
                       'malware_score', 'malware_total', 'percentage', 'feedback', 'quiz_type',
                       'time_taken', 'created_at')
    inlines = [UserAnswerInline]
    ordering = ('-created_at',)


@admin.register(UserAnswer)
class UserAnswerAdmin(admin.ModelAdmin):
    """Admin configuration for UserAnswer model."""
    list_display = ('quiz_attempt', 'question', 'selected_answer', 'correct_answer', 'is_correct')
    list_filter = ('is_correct',)
    readonly_fields = ('quiz_attempt', 'question', 'selected_answer', 'correct_answer', 'is_correct')
