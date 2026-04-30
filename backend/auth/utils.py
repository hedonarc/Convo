from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.validators import validate_email
from rest_framework_simplejwt.tokens import RefreshToken

# from users.translations import t


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }


def is_email(value):
    try:
        validate_email(value)
        return True
    except DjangoValidationError:
        return False
