from users.views import UsersListView
from django.urls import path
from users.views import (
    RegisterView,
    LoginView,
    UserDetailView,
)

urlpatterns = [
    path("register/", RegisterView.as_view()),
    path("login/", LoginView.as_view()),
    path("users/<int:user_id>", UserDetailView.as_view()),
    path("users/", UsersListView.as_view()),
]
