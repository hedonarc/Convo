from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend

from apps.authentication.utils import is_email

User = get_user_model()


class EmailOrUsernameBackend(ModelBackend):
    """
    Custom authentication backend to allow login with either username or email.
    """

    def authenticate(self, request, username_or_email=None, password=None, **kwargs):
        if username_or_email is None:
            username_or_email = kwargs.get(User.USERNAME_FIELD)

        try:
            if is_email(username_or_email):
                user = User.objects.get(email__iexact=username_or_email)
            else:
                user = User.objects.get(username__iexact=username_or_email)
        except User.DoesNotExist:
            # Run the default password hasher to prevent timing attacks
            User().set_password(password)
            return None
        except User.MultipleObjectsReturned:
            if is_email(username_or_email):
                return User.objects.filter(email__iexact=username_or_email).first()
            else:
                return User.objects.filter(username__iexact=username_or_email).first()

        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None
