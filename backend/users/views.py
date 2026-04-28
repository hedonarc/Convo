# Create your views here.
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from users.serializers import UserSerializer, LoginSerializer
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
        token = {"access": str(refresh.access_token), "refresh": str(refresh)}

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

        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        refresh = RefreshToken.for_user(user)
        token = {"access": str(refresh.access_token), "refresh": str(refresh)}

        return Response(
            data={
                "message": "You are logged in.",
                "token": token,
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


class GetUserByIdView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            serializer = UserSerializer(user)

            return Response(serializer.data, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response(
                {"message": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )


class UpdateUserView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        user = request.user
        data = request.data

        required_fields = ["username", "email", "first_name", "last_name"]
        for field in required_fields:
            if field not in data:
                return Response(
                    {"message": f"{field} is required for full update"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        user.username = data["username"]
        user.email = data["email"]
        user.first_name = data["first_name"]
        user.last_name = data["last_name"]

        # Checks if password is changed as well
        if data.get("password"):
            user.set_password(data["password"])

        user.save()

        return Response(
            {
                "message": "User fully updated successfully",
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


class DeleteUserView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user = request.user
        user.delete()

        return Response(
            {"message": "User deleted successfully"},
            status=status.HTTP_200_OK,
        )
