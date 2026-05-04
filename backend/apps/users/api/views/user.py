from django.contrib.auth.models import User
from django.db.models import Q
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.api.serializers.user import UserSerializer
from apps.users.pagination import StandardPagination


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
    pagination_class = StandardPagination

    def get(self, request):
        search = request.query_params.get("search", "")

        users = User.objects.all().order_by("id")
        if search:
            users = users.filter(
                Q(username__icontains=search)
                | Q(email__icontains=search)
                | Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
            )

        paginator = StandardPagination()
        paginated_users = paginator.paginate_queryset(users, request, view=self)

        serializer = UserSerializer(paginated_users, many=True)
        return paginator.get_paginated_response(serializer.data)
