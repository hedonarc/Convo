from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework import serializers

from utils.translations import t

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    confirm_password = serializers.CharField(write_only=True, required=True)

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
            raise serializers.ValidationError(t("validation.password_does_not_match"))
        try:
            validate_password(attrs["password"])
        except ValidationError as e:
            raise serializers.ValidationError(e) from e
        return attrs

    def validate_email(self, value):
        value = value.strip().lower()

        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(t("validation.email_exists"))
        return value

    def validate_username(self, value):
        value = value.strip()

        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError(t("validation.username_exists"))
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email"),
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
        )
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        username = attrs.get("username")
        email = attrs.get("email")
        password = attrs.get("password")

        username_or_email = username or email

        if not username_or_email:
            raise serializers.ValidationError(
                t("login.username_email_password_required")
            )

        user = authenticate(username_or_email=username_or_email, password=password)

        if not user:
            raise serializers.ValidationError(t("login.invalid_credentials"))

        attrs["user"] = user
        return attrs
