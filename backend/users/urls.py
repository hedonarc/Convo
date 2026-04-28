from django.urls import path
from users.views import (
    ProtectedView,
    RegisterView,
    LoginView,
    UserDetailView,
)

urlpatterns = [
    path("protected/", ProtectedView.as_view()),
    path("register/", RegisterView.as_view()),
    path("login/", LoginView.as_view()),
    # For (Getting, Updating and Deleting) the user by Id
    path("users/<int:user_id>", UserDetailView.as_view()),
]
