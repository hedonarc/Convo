from django.urls import path

from apps.authentication.api.views.auth import LoginView, RegisterView

urlpatterns = [
    path("register/", RegisterView.as_view()),
    path("login/", LoginView.as_view()),
]
