from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    """
    Custom user model for Convo.
    Enables future-proofing by allowing additional fields to be added easily.
    """

    class Meta:
        db_table = "users"
        verbose_name = "User"
        verbose_name_plural = "Users"

    def __str__(self):
        return self.username
