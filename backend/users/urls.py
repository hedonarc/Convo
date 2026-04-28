from django.urls import path
from users.views import (
    ProtectedView,
    RegisterView,
    LoginView,
    GetUserByIdView,
    UpdateUserView,
    DeleteUserView,
)

urlpatterns = [
    path("protected/", ProtectedView.as_view()),
    path("register/", RegisterView.as_view()),
    path("login/", LoginView.as_view()),
    path("users/<int:user_id>", GetUserByIdView.as_view()),
    path("users/update/", UpdateUserView.as_view()),
    path("users/delete", DeleteUserView.as_view()),
]
