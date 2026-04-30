import os

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand


# Usage: uv run manage.py setup_admin
# This will create a superuser with the following credentials:
# username: admin
# email: admin@convo.com
# password: admin
class Command(BaseCommand):
    help = "Create a superuser if it doesn't exist"

    def handle(self, *args, **options):
        username = os.environ.get("DJANGO_SUPERUSER_USERNAME", "admin")
        email = os.environ.get("DJANGO_SUPERUSER_EMAIL", "admin@convo.com")
        password = os.environ.get("DJANGO_SUPERUSER_PASSWORD", "admin")

        if not User.objects.filter(username=username).exists():
            User.objects.create_superuser(
                username=username, email=email, password=password
            )
            self.stdout.write(
                self.style.SUCCESS(f"Successfully created superuser: {username}")
            )
        else:
            self.stdout.write(
                self.style.WARNING(f"Superuser {username} already exists")
            )
