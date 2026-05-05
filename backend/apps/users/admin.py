from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models.user import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    """
    Custom User Admin to support the custom User model.
    """

    list_display = ("username", "email", "first_name", "last_name", "is_staff")
    search_fields = ("username", "email", "first_name", "last_name")
    ordering = ("username",)
