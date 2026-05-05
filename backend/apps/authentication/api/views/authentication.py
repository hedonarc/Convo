from django.db import transaction
from rest_framework import status
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView

from apps.authentication.api.serializers.authentication import (
    LoginSerializer,
    RegisterSerializer,
)
from apps.authentication.utils import get_tokens_for_user
from apps.users.api.serializers.user import UserSerializer
from utils.translations import t


class RegisterView(APIView):
    throttle_classes = [AnonRateThrottle]

    @transaction.atomic
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token = get_tokens_for_user(user)

        return Response(
            data={
                "message": t("register.success"),
                "token": token,
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    throttle_classes = [AnonRateThrottle]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        token = get_tokens_for_user(user)

        return Response(
            data={
                "message": t("login.success"),
                "token": token,
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )
