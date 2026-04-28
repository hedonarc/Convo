# Create your views here.
from django.contrib.auth.models import User
from users.serializers import UserSerializer, LoginSerializer
from users.translations import t
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken


class RegisterView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        token = {"access": str(refresh.access_token), "refresh": str(refresh)}

        return Response(
            data={
                "message": t("register.success"),
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
                "message": t("login.success"),
                "token": token,
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, __request__, user_id):
        try:
            user = User.objects.get(id=user_id)
            serializer = UserSerializer(user)

            return Response(serializer.data, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response(
                {"message": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )

    def patch(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)

            # Update basic fields
            # Username and Email update will be added in future, commenting for now

            # user.username = request.data.get("username", user.username)
            # user.email = request.data.get("email", user.email)
            user.first_name = request.data.get("first_name", user.first_name)
            user.last_name = request.data.get("last_name", user.last_name)

            # Handle password separately
            password = request.data.get("password")
            if password:
                user.set_password(password)
            user.save()

            return Response(
                {"message": "User updated", "user": UserSerializer(user).data},
                status=status.HTTP_200_OK,
            )
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )

    def delete(self, __request__, user_id):
        try:
            user = User.objects.get(id=user_id)
            user.delete()
            return Response({"message": "User deleted"}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )


class UsersListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        search = request.query_params.get("search", "")
        if search:
            users = (
                User.objects.filter(username__icontains=search)
                | User.objects.filter(email__icontains=search)
                | User.objects.filter(first_name__icontains=search)
                | User.objects.filter(last_name__icontains=search)
            )
        else:
            users = User.objects.all()

        serializer = UserSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
