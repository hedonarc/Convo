from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import serializers

from apps.authentication.utils import is_email
from utils.translations import t


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
            "confirm_password",
            "first_name",
            "last_name",
        ]

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError("validation.password_does_not_match")
        return attrs

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(t("validation.email_exists"))
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError(t("validation.username_exists"))
        return value

    def create(self, validated_data):
        validated_data.pop("confirm_password")

        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email"),
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
        )
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        username_or_email = attrs.get("username")
        password = attrs.get("password")

        username = username_or_email

        if is_email(username_or_email):
            try:
                username = User.objects.get(email=username_or_email).username
            except User.DoesNotExist:
                raise serializers.ValidationError(
                    t("login.invalid_credentials")
                ) from None

        user = authenticate(username=username, password=password)

        if not user:
            raise serializers.ValidationError(t("login.invalid_credentials"))

        attrs["user"] = user
        return attrs
