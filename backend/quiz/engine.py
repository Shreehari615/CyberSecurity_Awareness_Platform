"""
Smart Quiz Engine — Personalized + randomized question selection.
"""
import random
from .models import Question, UserAnswer


# Personalized question counts per quiz type
PERSONALIZED_COUNT_MAP = {
    '20': 5,   # 5 personalized + 15 random
    '30': 8,   # 8 personalized + 22 random
    '50': 12,  # 12 personalized + 38 random
}


def _user_type(user):
    return 'public' if user.user_type == 'admin' else user.user_type


def _get_survey_categories(user):
    """Return personalization categories from user's cyber survey."""
    try:
        return user.cyber_survey.get_personalization_categories()
    except Exception:
        return ['password_security', 'phishing']


def _pick_from_pool(pool, count, exclude_ids):
    """Pick up to `count` questions from pool, excluding IDs."""
    available = [q for q in pool if q.id not in exclude_ids]
    if len(available) <= count:
        return available
    return random.sample(available, count)


def _get_personalized_questions(user, count, exclude_ids):
    """Select questions matching survey-based categories."""
    categories = _get_survey_categories(user)
    user_type = _user_type(user)

    pool = list(
        Question.objects.filter(
            is_active=True,
            target_user_type=user_type,
            category__in=categories,
        ).exclude(id__in=exclude_ids)
    )

    if len(pool) < count:
        # Widen pool with related categories
        pool = list(
            Question.objects.filter(is_active=True, target_user_type=user_type)
            .exclude(id__in=exclude_ids)
        )

    return _pick_from_pool(pool, count, exclude_ids)


def _get_random_questions(user, count, exclude_ids):
    """Select random questions excluding already chosen."""
    user_type = _user_type(user)
    # Build as a set so that | (set union) operations work correctly below
    attempted_ids = set(
        UserAnswer.objects.filter(quiz_attempt__user=user)
        .values_list('question_id', flat=True)
        .distinct()
    )

    all_questions = Question.objects.filter(is_active=True, target_user_type=user_type)
    unattempted = list(all_questions.exclude(id__in=attempted_ids | exclude_ids))

    if len(unattempted) >= count:
        return random.sample(unattempted, count)

    selected = list(unattempted)
    remaining = count - len(selected)

    if remaining > 0:
        reuse = list(
            all_questions.filter(id__in=attempted_ids)
            .exclude(id__in=exclude_ids | {q.id for q in selected})
        )
        if len(reuse) >= remaining:
            selected.extend(random.sample(reuse, remaining))
        else:
            selected.extend(reuse)
            still = count - len(selected)
            if still > 0:
                fallback = list(
                    all_questions.exclude(id__in=exclude_ids | {q.id for q in selected})[:still]
                )
                selected.extend(fallback)

    return selected[:count]


def get_quiz_questions(user, quiz_type='20'):
    """
    Build a quiz with personalized + remaining random questions.
    - 20 questions: 5 personalized + 15 random
    - 30 questions: 8 personalized + 22 random
    - 50 questions: 12 personalized + 38 random
    No question repeats within the same quiz.
    """
    total = int(quiz_type)
    personalized_n = PERSONALIZED_COUNT_MAP.get(quiz_type, 5)

    selected = []
    selected_ids = set()

    # Step 1: Personalized questions based on survey
    if hasattr(user, 'survey_completed') and user.survey_completed:
        personalized_n = min(personalized_n, total)
        personalized = _get_personalized_questions(user, personalized_n, selected_ids)
        selected.extend(personalized)
        selected_ids.update(q.id for q in personalized)

    # Step 2: Fill remaining with random unattempted questions
    remaining = total - len(selected)
    if remaining > 0:
        random_qs = _get_random_questions(user, remaining, selected_ids)
        for q in random_qs:
            if q.id not in selected_ids:
                selected.append(q)
                selected_ids.add(q.id)

    # Ensure exact count
    if len(selected) < total:
        user_type = _user_type(user)
        extra = list(
            Question.objects.filter(is_active=True, target_user_type=user_type)
            .exclude(id__in=selected_ids)[: total - len(selected)]
        )
        selected.extend(extra)

    selected = selected[:total]
    random.shuffle(selected)
    return selected

