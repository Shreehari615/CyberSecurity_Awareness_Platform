from rest_framework import serializers
from .models import Badge, UserBadge
from quiz.models import QuizAttempt


class BadgeSerializer(serializers.ModelSerializer):
    """Serializer for Badge model."""

    class Meta:
        model = Badge
        fields = ['id', 'name', 'description', 'icon', 'criteria_type']


class UserBadgeSerializer(serializers.ModelSerializer):
    """Serializer for UserBadge with nested badge info."""
    badge = BadgeSerializer(read_only=True)

    class Meta:
        model = UserBadge
        fields = ['id', 'badge', 'earned_at']


class LeaderboardEntrySerializer(serializers.ModelSerializer):
    """Serializer for leaderboard entries."""
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    user_type = serializers.CharField(source='user.user_type', read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)

    class Meta:
        model = QuizAttempt
        fields = ['user_id', 'user_name', 'user_type', 'score', 'total_questions', 'percentage', 'created_at']
