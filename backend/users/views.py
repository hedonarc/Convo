# Create your views here.
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
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
        email = request.data.get("email")
        password = request.data.get("password")
        first_name = request.data.get("first_name")
        last_name = request.data.get("last_name")
        username = request.data.get("username")

        if not email or not password or not first_name or not last_name or not username:
            return Response(
                data={"message": "Missing fields"}, status=status.HTTP_400_BAD_REQUEST
            )

        if (
            User.objects.filter(email=email).exists()
            or User.objects.filter(username=username).exists()
        ):
            return Response(
                data={"message": "User already exists"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        User.objects.create_user(
            email=email,
            password=password,
            username=username,
            first_name=first_name,
            last_name=last_name,
        )
        return Response(
            data={"message": "You are registered"}, status=status.HTTP_201_CREATED
        )

class LoginView(APIView):
    def post(self, request):
        username_email = request.data.get("username")
        password = request.data.get("password")

        if not username_email or not password:
            return Response(
                data={"message": "Username/Email & Password required."}, status=status.HTTP_400_BAD_REQUEST
            )

        # Email hai ya nai check kr rha hu
        if "@" in username_email:
            try:
                username_email = User.objects.get(email=username_email).username

            except User.DoesNotExist:
                return Response({"message": "Invalid credentials"},
                    status=status.HTTP_401_UNAUTHORIZED)

        user = authenticate(username=username_email, password=password)
        if not user:
            return Response({"message": "Invalid Credentials"},status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)

        return Response({"access":str(refresh.access_token), "refresh":str(refresh)})
