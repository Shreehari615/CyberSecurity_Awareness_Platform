from django.db import models
from django.conf import settings


class Badge(models.Model):
    """Achievement badge that users can earn."""

    CRITERIA_CHOICES = [
        ('first_quiz', 'Complete First Quiz'),
        ('perfect_score', 'Score 100%'),
        ('score_above_80', 'Score Above 80%'),
        ('attempts_5', 'Complete 5 Quizzes'),
        ('attempts_10', 'Complete 10 Quizzes'),
        ('phishing_expert', 'Score 90%+ on Phishing'),
        ('malware_expert', 'Score 90%+ on Malware'),
        ('speed_demon', 'Complete in Under Half Time'),
        ('consistent', '3 Scores Above 70%'),
        ('improved', 'Improve Score by 20%+'),
    ]

    name = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.CharField(max_length=50, help_text="Emoji or icon identifier")
    criteria_type = models.CharField(max_length=50, choices=CRITERIA_CHOICES, unique=True)
    criteria_value = models.IntegerField(default=0, help_text="Threshold value for the criteria")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Badge'
        verbose_name_plural = 'Badges'

    def __str__(self):
        return f"{self.icon} {self.name}"


class UserBadge(models.Model):
    """Junction table tracking which badges a user has earned."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='badges'
    )
    badge = models.ForeignKey(
        Badge,
        on_delete=models.CASCADE,
        related_name='user_badges'
    )
    earned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-earned_at']
        unique_together = ('user', 'badge')
        verbose_name = 'User Badge'
        verbose_name_plural = 'User Badges'

    def __str__(self):
        return f"{self.user.full_name} - {self.badge.name}"
