from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Max, Subquery, OuterRef

from .models import Badge, UserBadge
from .serializers import UserBadgeSerializer, LeaderboardEntrySerializer
from quiz.models import QuizAttempt


class LeaderboardView(APIView):
    """Global leaderboard — Top 10 users by highest score, tiebreak by latest attempt."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get each user's best attempt (highest percentage, then most recent)
        best_attempts = (
            QuizAttempt.objects
            .values('user')
            .annotate(max_pct=Max('percentage'))
        )

        # Get the actual attempt records for top performers
        top_attempts = []
        seen_users = set()

        all_attempts = QuizAttempt.objects.select_related('user').order_by(
            '-percentage', '-created_at'
        )

        for attempt in all_attempts:
            if attempt.user.id not in seen_users:
                seen_users.add(attempt.user.id)
                top_attempts.append(attempt)
                if len(top_attempts) >= 10:
                    break

        serializer = LeaderboardEntrySerializer(top_attempts, many=True)
        data = serializer.data

        # Add rank numbers
        for i, entry in enumerate(data):
            entry['rank'] = i + 1

        return Response({
            'leaderboard': data,
            'current_user_id': request.user.id,
        })


class UserBadgesView(APIView):
    """Get current user's earned badges."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_badges = UserBadge.objects.filter(user=request.user).select_related('badge')
        serializer = UserBadgeSerializer(user_badges, many=True)

        # Also return all available badges with earned status
        all_badges = Badge.objects.all()
        earned_ids = set(user_badges.values_list('badge_id', flat=True))

        available_badges = []
        for badge in all_badges:
            available_badges.append({
                'id': badge.id,
                'name': badge.name,
                'description': badge.description,
                'icon': badge.icon,
                'criteria_type': badge.criteria_type,
                'earned': badge.id in earned_ids,
            })

        return Response({
            'earned_badges': serializer.data,
            'all_badges': available_badges,
        })


def award_badges(user, quiz_attempt):
    """
    Check and award badges after a quiz submission.
    Returns list of newly awarded badge names.
    """
    new_badges = []

    # Get user's total attempts
    total_attempts = QuizAttempt.objects.filter(user=user).count()

    # Get all badge definitions
    badges = {b.criteria_type: b for b in Badge.objects.all()}

    def try_award(criteria_type):
        """Try to award a badge, skip if already earned or badge doesn't exist."""
        badge = badges.get(criteria_type)
        if badge and not UserBadge.objects.filter(user=user, badge=badge).exists():
            UserBadge.objects.create(user=user, badge=badge)
            new_badges.append({'name': badge.name, 'icon': badge.icon, 'description': badge.description})

    # First Quiz
    if total_attempts == 1:
        try_award('first_quiz')

    # Perfect Score
    if float(quiz_attempt.percentage) == 100:
        try_award('perfect_score')

    # Score Above 80%
    if float(quiz_attempt.percentage) >= 80:
        try_award('score_above_80')

    # 5 Quizzes
    if total_attempts >= 5:
        try_award('attempts_5')

    # 10 Quizzes
    if total_attempts >= 10:
        try_award('attempts_10')

    # Phishing Expert (90%+ on phishing questions)
    if quiz_attempt.phishing_total > 0:
        phishing_pct = quiz_attempt.phishing_score / quiz_attempt.phishing_total * 100
        if phishing_pct >= 90:
            try_award('phishing_expert')

    # Malware Expert (90%+ on malware questions)
    if quiz_attempt.malware_total > 0:
        malware_pct = quiz_attempt.malware_score / quiz_attempt.malware_total * 100
        if malware_pct >= 90:
            try_award('malware_expert')

    # Speed Demon (complete in under half the allowed time)
    max_time = {'20': 30 * 60, '30': 40 * 60, '50': 50 * 60}.get(quiz_attempt.quiz_type, 30 * 60)
    if quiz_attempt.time_taken > 0 and quiz_attempt.time_taken < max_time / 2:
        try_award('speed_demon')

    # Consistent (3+ scores above 70%)
    good_scores = QuizAttempt.objects.filter(user=user, percentage__gte=70).count()
    if good_scores >= 3:
        try_award('consistent')

    # Improved (score improved by 20%+ from first attempt)
    attempts = QuizAttempt.objects.filter(user=user).order_by('created_at')
    if attempts.count() >= 2:
        first_pct = float(attempts.first().percentage)
        current_pct = float(quiz_attempt.percentage)
        if first_pct > 0 and (current_pct - first_pct) >= 20:
            try_award('improved')

    return new_badges
