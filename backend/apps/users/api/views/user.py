from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.api.permissions import IsOwnerOrReadOnly
from apps.users.api.serializers.user import UserSerializer
from apps.users.pagination import StandardPagination

User = get_user_model()


class UserDetailView(APIView):
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]

    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {"message": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )

        self.check_object_permissions(request, user)
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )

        self.check_object_permissions(request, user)

        serializer = UserSerializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {"message": "User updated", "user": serializer.data},
            status=status.HTTP_200_OK,
        )

    def delete(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )

        self.check_object_permissions(request, user)
        user.delete()
        return Response({"message": "User deleted"}, status=status.HTTP_200_OK)


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
