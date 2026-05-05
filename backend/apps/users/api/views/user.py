from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from apps.users.api.permissions import IsOwnerOrReadOnly
from apps.users.api.serializers.user import UserSerializer
from apps.users.pagination import StandardPagination

User = get_user_model()


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a user instance.
    """

    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
    lookup_url_kwarg = "user_id"


class UsersListView(generics.ListAPIView):
    """
    List all users with optional search filtering.
    """

    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardPagination

    def get_queryset(self):
        queryset = User.objects.all().order_by("id")
        search = self.request.query_params.get("search", "")

        if search:
            queryset = queryset.filter(
                Q(username__icontains=search)
                | Q(email__icontains=search)
                | Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
            )

        return queryset
