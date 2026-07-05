from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from datetime import timedelta

from .models import User, EmailOTP, CyberSurvey
from .utils import sanitize_input, format_display_name


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration with email OTP verification."""
    password = serializers.CharField(write_only=True, min_length=8, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)
    otp = serializers.CharField(write_only=True, max_length=6, required=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'full_name', 'password', 'confirm_password', 'user_type',
            'age', 'gender', 'occupation', 'country', 'mobile',
            'security_question', 'otp',
        ]
        extra_kwargs = {
            'age': {'required': False},
            'gender': {'required': False},
            'occupation': {'required': False},
            'country': {'required': False},
            'mobile': {'required': False},
            'security_question': {'required': False},
        }

    def validate_email(self, value):
        email = value.lower().strip()
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return email

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})

        email = attrs['email']
        otp = attrs.get('otp', '')
        otp_record = EmailOTP.objects.filter(
            email=email, otp=otp, is_used=False, expires_at__gt=timezone.now()
        ).order_by('-created_at').first()

        if not otp_record:
            raise serializers.ValidationError({"otp": "Invalid or expired verification code."})

        attrs['_otp_record'] = otp_record
        attrs['full_name'] = sanitize_input(attrs.get('full_name', ''), 255)
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        otp = validated_data.pop('otp')
        otp_record = validated_data.pop('_otp_record')
        validated_data['is_email_verified'] = True

        user = User.objects.create_user(**validated_data)
        otp_record.is_used = True
        otp_record.save(update_fields=['is_used'])
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer for user login."""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email', '').lower().strip()
        password = attrs.get('password', '')

        user = authenticate(email=email, password=password)
        if not user:
            raise serializers.ValidationError("Invalid email or password.")
        if not user.is_active:
            raise serializers.ValidationError("This account is deactivated.")

        attrs['user'] = user
        return attrs


class SmartAuthSerializer(serializers.Serializer):
    """Step 1: email + password — check if user exists or needs registration."""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=1)

    def validate_email(self, value):
        return value.lower().strip()


class SendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        email = value.lower().strip()
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError("This email is already registered.")
        return email


class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)

    def validate(self, attrs):
        email = attrs['email'].lower().strip()
        otp = attrs['otp'].strip()
        record = EmailOTP.objects.filter(
            email=email, otp=otp, is_used=False, expires_at__gt=timezone.now()
        ).order_by('-created_at').first()
        if not record:
            raise serializers.ValidationError({"otp": "Invalid or expired verification code."})
        attrs['email'] = email
        return attrs


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user profile."""
    total_attempts = serializers.SerializerMethodField()
    best_score = serializers.SerializerMethodField()
    average_score = serializers.SerializerMethodField()
    display_name = serializers.SerializerMethodField()
    rank = serializers.SerializerMethodField()
    total_learners = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'full_name', 'display_name', 'user_type', 'avatar',
            'date_joined', 'is_email_verified', 'age', 'gender', 'occupation',
            'country', 'mobile', 'xp_points', 'daily_streak', 'achievement_level',
            'survey_completed',
            'total_attempts', 'best_score', 'average_score', 'rank', 'total_learners',
        ]
        read_only_fields = [
            'id', 'email', 'date_joined', 'is_email_verified',
            'xp_points', 'daily_streak', 'achievement_level', 'survey_completed',
        ]

    def get_display_name(self, obj):
        return format_display_name(obj.full_name)

    def get_total_attempts(self, obj):
        return obj.quiz_attempts.count()

    def get_best_score(self, obj):
        best = obj.quiz_attempts.order_by('-percentage').first()
        return float(best.percentage) if best else 0

    def get_average_score(self, obj):
        attempts = obj.quiz_attempts.all()
        if not attempts:
            return 0
        return round(sum(float(a.percentage) for a in attempts) / len(attempts), 2)

    def get_rank(self, obj):
        from quiz.gamification import get_user_rank
        return get_user_rank(obj).get('rank')

    def get_total_learners(self, obj):
        from quiz.gamification import get_user_rank
        return get_user_rank(obj).get('total_learners', 0)


class CyberSurveySerializer(serializers.ModelSerializer):
    class Meta:
        model = CyberSurvey
        fields = [
            'cyber_attack_experienced', 'internet_always_on',
            'password_change_frequency', 'uses_2fa', 'clicked_suspicious',
        ]

    def create(self, validated_data):
        user = self.context['request'].user
        if hasattr(user, 'cyber_survey'):
            raise serializers.ValidationError("Survey already completed.")
        survey = CyberSurvey.objects.create(user=user, **validated_data)
        user.survey_completed = True
        user.save(update_fields=['survey_completed'])
        return survey


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8, validators=[validate_password])

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        try:
            User.objects.get(email=value.lower())
        except User.DoesNotExist:
            pass
        return value.lower()


class ResetPasswordSerializer(serializers.Serializer):
    token = serializers.UUIDField()
    new_password = serializers.CharField(min_length=8, validators=[validate_password])
    confirm_password = serializers.CharField()

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs


class AdminUserSerializer(serializers.ModelSerializer):
    total_attempts = serializers.SerializerMethodField()
    best_score = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'full_name', 'user_type', 'is_active',
            'date_joined', 'total_attempts', 'best_score', 'is_email_verified',
        ]

    def get_total_attempts(self, obj):
        return obj.quiz_attempts.count()

    def get_best_score(self, obj):
        best = obj.quiz_attempts.order_by('-percentage').first()
        return float(best.percentage) if best else 0
