# Create your views here.
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from users.serializers import UserSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from rest_framework_simplejwt.tokens import RefreshToken


class ProtectedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(
            data={"message": "You are authenticated"}, status=status.HTTP_200_OK
        )


class RegisterView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        token = {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }

        return Response(
            data={
                "message": "You are registered",
                "token": token,
                "user": serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    def post(self, request):
        username_email = request.data.get("username")
        password = request.data.get("password")

        if not username_email or not password:
            return Response(
                data={"message": "Username/Email & Password required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Email hai ya nai check kr rha hu
        if "@" in username_email:
            try:
                username_email = User.objects.get(email=username_email).username

            except User.DoesNotExist:
                return Response(
                    {"message": "Invalid credentials"},
                    status=status.HTTP_401_UNAUTHORIZED,
                )

        user = authenticate(username=username_email, password=password)
        if not user:
            return Response(
                {"message": "Invalid Credentials"}, status=status.HTTP_401_UNAUTHORIZED
            )

        refresh = RefreshToken.for_user(user)
        token = {"access": str(refresh.access_token), "refresh": str(refresh)}

        return Response(
            data={
                "message": "You are logged in.",
                "token": token,
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                },
            },
            status=status.HTTP_200_OK,
        )
