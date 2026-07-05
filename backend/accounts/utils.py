"""Account utility helpers."""
import re
import secrets
import string


def format_display_name(full_name):
    """Return properly capitalized display name, e.g. 'shreehari' -> 'Shreehari'."""
    if not full_name:
        return ''
    parts = re.split(r'\s+', full_name.strip())
    return ' '.join(p[:1].upper() + p[1:].lower() if p else '' for p in parts)


def generate_otp(length=6):
    return ''.join(secrets.choice(string.digits) for _ in range(length))


def generate_strong_password(min_len=12, max_len=16):
    """Generate a secure random password meeting complexity requirements."""
    length = secrets.randbelow(max_len - min_len + 1) + min_len
    lower = string.ascii_lowercase
    upper = string.ascii_uppercase
    digits = string.digits
    special = '!@#$%^&*?_-'
    all_chars = lower + upper + digits + special

    password = [
        secrets.choice(lower),
        secrets.choice(upper),
        secrets.choice(digits),
        secrets.choice(special),
    ]
    password += [secrets.choice(all_chars) for _ in range(length - 4)]
    secrets.SystemRandom().shuffle(password)
    return ''.join(password)


def sanitize_input(value, max_length=500):
    """Basic input sanitization — strip and truncate."""
    if value is None:
        return ''
    text = str(value).strip()
    return text[:max_length]
