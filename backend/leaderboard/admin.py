from django.contrib import admin
from .models import Badge, UserBadge


@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    """Admin configuration for Badge model."""
    list_display = ('icon', 'name', 'criteria_type', 'criteria_value', 'created_at')
    search_fields = ('name', 'description')
    list_filter = ('criteria_type',)


@admin.register(UserBadge)
class UserBadgeAdmin(admin.ModelAdmin):
    """Admin configuration for UserBadge model."""
    list_display = ('user', 'badge', 'earned_at')
    list_filter = ('badge', 'earned_at')
    search_fields = ('user__email', 'user__full_name', 'badge__name')
    readonly_fields = ('user', 'badge', 'earned_at')
