from users.views import UsersListView
from django.urls import path
from users.views import UserDetailView

urlpatterns = [
    path("users/<int:user_id>", UserDetailView.as_view()),
    path("users/", UsersListView.as_view()),
]
