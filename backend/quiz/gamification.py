"""Gamification helpers — XP, streaks, levels."""
from django.utils import timezone
from datetime import timedelta


def calculate_xp(score, total, time_taken, quiz_type):
    """Calculate XP earned from a quiz attempt."""
    base = score * 10
    bonus = 0
    pct = (score / total * 100) if total else 0
    if pct >= 80:
        bonus += 50
    if pct == 100:
        bonus += 100
    if quiz_type == '50':
        bonus += 30
    elif quiz_type == '30':
        bonus += 15
    # Speed bonus
    max_time = {'20': 1800, '30': 2400, '50': 3000}.get(quiz_type, 1800)
    if time_taken > 0 and time_taken < max_time * 0.5:
        bonus += 25
    return base + bonus


def update_user_gamification(user, xp_earned):
    """Update XP, streak, and achievement level after quiz."""
    today = timezone.now().date()
    user.xp_points = (user.xp_points or 0) + xp_earned

    if user.last_activity_date:
        diff = (today - user.last_activity_date).days
        if diff == 1:
            user.daily_streak = (user.daily_streak or 0) + 1
        elif diff > 1:
            user.daily_streak = 1
    else:
        user.daily_streak = 1

    user.last_activity_date = today
    user.achievement_level = max(1, user.xp_points // 200 + 1)
    user.save(update_fields=['xp_points', 'daily_streak', 'last_activity_date', 'achievement_level'])
    return user


def get_user_rank(user):
    """Return user's leaderboard rank, total learners, and motivation message."""
    from quiz.models import QuizAttempt
    from accounts.models import User

    # Rank by best quiz score (percentage)
    all_attempts = QuizAttempt.objects.select_related('user').order_by('-percentage', '-created_at')
    seen = set()
    ranked = []
    for attempt in all_attempts:
        if attempt.user_id not in seen:
            seen.add(attempt.user_id)
            ranked.append(attempt)

    total = len(ranked)
    rank = None
    for i, attempt in enumerate(ranked):
        if attempt.user_id == user.id:
            rank = i + 1
            break

    # XP Rank calculation for the motivation message
    all_users = list(User.objects.exclude(user_type='admin').order_by('-xp_points', '-date_joined'))
    user_xp_rank = None
    for idx, u in enumerate(all_users):
        if u.id == user.id:
            user_xp_rank = idx + 1
            break

    points_to_top20 = 30
    if not all_users:
        points_to_top20 = 30
    elif len(all_users) >= 20:
        top_20_xp = all_users[19].xp_points
        if user.xp_points < top_20_xp:
            points_to_top20 = top_20_xp - user.xp_points
        else:
            points_to_top20 = 0
    else:
        # Fewer than 20 users: target the 3rd user's XP (or top user if < 3)
        target_index = min(len(all_users) - 1, 2)
        top_3_xp = all_users[target_index].xp_points
        if user.xp_points < top_3_xp:
            points_to_top20 = top_3_xp - user.xp_points
        else:
            points_to_top20 = 30

    if points_to_top20 <= 0:
        points_to_top20 = 30

    motivation = f"You're only {points_to_top20} points away from the Top 20! Would you like to take another quiz?"
    if user_xp_rank and user_xp_rank <= 20 and len(all_users) >= 20:
        motivation = f"Awesome! You are ranked #{user_xp_rank} in XP points. Keep it up!"

    return {
        'rank': rank,
        'total_learners': total,
        'points_to_top20': points_to_top20,
        'motivation_message': motivation,
    }
