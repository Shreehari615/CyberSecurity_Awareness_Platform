from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
import uuid


class UserManager(BaseUserManager):
    """Custom user manager where email is the unique identifier."""

    def create_user(self, email, full_name, password=None, **extra_fields):
        if not email:
            raise ValueError('Users must have an email address')
        email = self.normalize_email(email)
        user = self.model(email=email, full_name=full_name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, full_name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('user_type', 'admin')
        extra_fields.setdefault('is_email_verified', True)
        return self.create_user(email, full_name, password, **extra_fields)


class User(AbstractUser):
    """Custom User model with email as the primary identifier."""

    USER_TYPE_CHOICES = [
        ('student', 'Student'),
        ('professional', 'Working Professional'),
        ('public', 'General Public'),
        ('admin', 'Administrator'),
    ]

    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
        ('prefer_not', 'Prefer not to say'),
    ]

    username = None
    email = models.EmailField('email address', unique=True)
    full_name = models.CharField(max_length=255)
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default='public')
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    is_email_verified = models.BooleanField(default=False)

    # Extended profile fields
    age = models.PositiveIntegerField(null=True, blank=True)
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, blank=True, default='')
    occupation = models.CharField(max_length=120, blank=True, default='')
    country = models.CharField(max_length=80, blank=True, default='')
    mobile = models.CharField(max_length=20, blank=True, default='')
    security_question = models.CharField(max_length=255, blank=True, default='')
    security_answer_hash = models.CharField(max_length=128, blank=True, default='')

    # Gamification
    xp_points = models.PositiveIntegerField(default=0)
    daily_streak = models.PositiveIntegerField(default=0)
    last_activity_date = models.DateField(null=True, blank=True)
    achievement_level = models.PositiveIntegerField(default=1)
    survey_completed = models.BooleanField(default=False)

    password_reset_token = models.UUIDField(null=True, blank=True)
    password_reset_token_created = models.DateTimeField(null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']

    objects = UserManager()

    class Meta:
        ordering = ['-date_joined']
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return f"{self.full_name} ({self.email})"

    @property
    def display_name(self):
        from .utils import format_display_name
        return format_display_name(self.full_name) or self.email.split('@')[0]


class EmailOTP(models.Model):
    """One-time password for email verification during registration."""

    email = models.EmailField(db_index=True)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"OTP for {self.email}"


class CyberSurvey(models.Model):
    """One-time cyber awareness onboarding survey per user."""

    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name='cyber_survey'
    )
    cyber_attack_experienced = models.CharField(max_length=10)  # yes / no
    internet_always_on = models.CharField(max_length=20)  # always / needed
    password_change_frequency = models.CharField(max_length=20)  # monthly / 3months / 6months / never
    uses_2fa = models.CharField(max_length=10)  # yes / no
    clicked_suspicious = models.CharField(max_length=15)  # yes / no / not_sure
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Cyber Survey'
        verbose_name_plural = 'Cyber Surveys'

    def __str__(self):
        return f"Survey — {self.user.email}"

    def get_personalization_categories(self):
        """Map survey answers to question categories for personalized quizzes."""
        categories = set()
        if self.password_change_frequency == 'never':
            categories.update(['password_security', 'authentication'])
        if self.internet_always_on == 'always':
            categories.update(['public_wifi', 'network_security'])
        if self.cyber_attack_experienced == 'yes':
            categories.update(['phishing', 'malware', 'ransomware'])
        if self.uses_2fa == 'no':
            categories.update(['multi_factor_authentication', 'authentication'])
        if self.clicked_suspicious in ('yes', 'not_sure'):
            categories.update(['phishing', 'social_engineering', 'email_security'])
        if not categories:
            categories.update(['password_security', 'phishing'])
        return list(categories)
