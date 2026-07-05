from django.db import models
from django.conf import settings


# Expanded cybersecurity categories for the question bank
QUESTION_CATEGORIES = [
    ('password_security', 'Password Security'),
    ('phishing', 'Phishing'),
    ('malware', 'Malware'),
    ('ransomware', 'Ransomware'),
    ('spyware', 'Spyware'),
    ('adware', 'Adware'),
    ('trojans', 'Trojans'),
    ('worms', 'Worms'),
    ('viruses', 'Viruses'),
    ('social_engineering', 'Social Engineering'),
    ('cyber_bullying', 'Cyber Bullying'),
    ('spoofing', 'Spoofing'),
    ('identity_theft', 'Identity Theft'),
    ('data_privacy', 'Data Privacy'),
    ('encryption', 'Encryption'),
    ('authentication', 'Authentication'),
    ('multi_factor_authentication', 'Multi-Factor Authentication'),
    ('public_wifi', 'Public Wi-Fi'),
    ('vpn', 'VPN'),
    ('cloud_security', 'Cloud Security'),
    ('browser_security', 'Browser Security'),
    ('safe_downloads', 'Safe Downloads'),
    ('digital_footprint', 'Digital Footprint'),
    ('mobile_security', 'Mobile Security'),
    ('banking_fraud', 'Banking Fraud'),
    ('upi_fraud', 'UPI Fraud'),
    ('qr_code_scam', 'QR Code Scam'),
    ('fake_apps', 'Fake Apps'),
    ('fake_websites', 'Fake Websites'),
    ('ai_scams', 'AI Scams'),
    ('deepfake', 'Deepfake'),
    ('online_shopping_fraud', 'Online Shopping Fraud'),
    ('email_security', 'Email Security'),
    ('insider_threats', 'Insider Threats'),
    ('iot_security', 'IoT Security'),
    ('network_security', 'Network Security'),
    ('cyber_laws', 'Cyber Laws'),
    ('cyber_ethics', 'Cyber Ethics'),
    ('safe_social_media', 'Safe Social Media Practices'),
    ('defamation', 'Defamation'),
    ('hacking', 'Hacking'),
]


class Question(models.Model):
    """A cybersecurity quiz question."""

    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]

    TARGET_USER_CHOICES = [
        ('student', 'Student'),
        ('professional', 'Professional'),
        ('public', 'General Public'),
    ]

    question_text = models.TextField()
    option_a = models.CharField(max_length=500)
    option_b = models.CharField(max_length=500)
    option_c = models.CharField(max_length=500)
    option_d = models.CharField(max_length=500)
    correct_answer = models.CharField(max_length=1, choices=[
        ('A', 'Option A'), ('B', 'Option B'), ('C', 'Option C'), ('D', 'Option D')
    ])
    explanation = models.TextField(blank=True, help_text="Explanation shown during answer review")
    category = models.CharField(max_length=50, choices=QUESTION_CATEGORIES, default='phishing')
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='medium')
    target_user_type = models.CharField(max_length=20, choices=TARGET_USER_CHOICES)
    is_active = models.BooleanField(default=True)
    is_personalized = models.BooleanField(default=False, help_text="Generated for survey-based personalization")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Question'
        verbose_name_plural = 'Questions'

    def __str__(self):
        return f"[{self.category}/{self.difficulty}] {self.question_text[:80]}..."


class QuizAttempt(models.Model):
    """A user's quiz attempt with scores and feedback."""

    QUIZ_TYPE_CHOICES = [
        ('20', '20 Questions - 30 Minutes'),
        ('30', '30 Questions - 40 Minutes'),
        ('50', '50 Questions - 50 Minutes'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='quiz_attempts'
    )
    score = models.IntegerField(default=0)
    total_questions = models.IntegerField(default=20)
    phishing_score = models.IntegerField(default=0)
    phishing_total = models.IntegerField(default=0)
    malware_score = models.IntegerField(default=0)
    malware_total = models.IntegerField(default=0)
    percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    feedback = models.TextField(blank=True)
    quiz_type = models.CharField(max_length=10, choices=QUIZ_TYPE_CHOICES, default='20')
    time_taken = models.IntegerField(default=0, help_text="Time taken in seconds")
    xp_earned = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Quiz Attempt'
        verbose_name_plural = 'Quiz Attempts'

    def __str__(self):
        return f"{self.user.full_name} - {self.percentage}% ({self.created_at.strftime('%Y-%m-%d')})"


class UserAnswer(models.Model):
    """Individual answer within a quiz attempt."""

    quiz_attempt = models.ForeignKey(
        QuizAttempt,
        on_delete=models.CASCADE,
        related_name='answers'
    )
    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        related_name='user_answers'
    )
    selected_answer = models.CharField(max_length=1, choices=[
        ('A', 'Option A'), ('B', 'Option B'), ('C', 'Option C'), ('D', 'Option D')
    ])
    correct_answer = models.CharField(max_length=1)
    is_correct = models.BooleanField(default=False)

    class Meta:
        verbose_name = 'User Answer'
        verbose_name_plural = 'User Answers'

    def __str__(self):
        status = "✓" if self.is_correct else "✗"
        return f"{status} Q{self.question.id} - Selected: {self.selected_answer}"
