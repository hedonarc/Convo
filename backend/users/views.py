# Create your views here.
from django.contrib.auth.models import User
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


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
