from django.contrib.auth.models import User
from rest_framework import serializers
from users.translations import t


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "username", "first_name", "last_name"]
