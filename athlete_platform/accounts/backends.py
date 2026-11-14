# accounts/backends.py
import re
from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend
from django.db.models import Q


def normalize_mobile(raw_value):
    """Strip whitespace/punctuation and keep trailing 10 digits if prefixed with country code."""
    if not raw_value:
        return ''
    digits = re.sub(r'\D', '', str(raw_value))
    if len(digits) > 10 and digits.startswith('91'):
        return digits[-10:]
    return digits


class EmailOrMobileBackend(ModelBackend):
    """
    Authenticates a user by email, mobile_number, or username (for legacy/admin accounts).
    """
    def authenticate(self, request, username=None, password=None, identifier=None, **kwargs):
        login_id = (identifier or username or kwargs.get('email') or '').strip()
        if not login_id or not password:
            return None

        User = get_user_model()
        normalized_phone = normalize_mobile(login_id)

        query = Q(email__iexact=login_id) | Q(username__iexact=login_id)
        if normalized_phone:
            query |= Q(mobile_number=normalized_phone) | Q(mobile_number=login_id)

        user = User.objects.filter(query).first()
        if user and user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None

