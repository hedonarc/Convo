from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework import serializers
from users.translations import t


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "username", "first_name", "last_name", "password"]
        extra_kwargs = {"password": {"write_only": True}}

    def validate(self, attrs):
        email = attrs.get("email")
        username = attrs.get("username")

        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError(t("validation.email_exists"))

        if User.objects.filter(username=username).exists():
            raise serializers.ValidationError(t("validation.username_exists"))

        return attrs

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
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        username_email = attrs.get("username")
        password = attrs.get("password")

        if "@" in username_email:
            try:
                username_email = User.objects.get(email=username_email).username
            except User.DoesNotExist:
                raise serializers.ValidationError("Invalid credentials")

        user = authenticate(username=username_email, password=password)
        if not user:
            raise serializers.ValidationError("Invalid credentials")

        attrs["user"] = user
        return attrs
