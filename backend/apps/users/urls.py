from django.urls import path

from apps.users.api.views.user import UserDetailView, UsersListView

urlpatterns = [
    path("users/<int:user_id>", UserDetailView.as_view()),
    path("users/", UsersListView.as_view()),
]
