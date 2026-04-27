from django.urls import path
from users.views import ProtectedView,RegisterView,LoginView

urlpatterns = [
    path("protected/", ProtectedView.as_view()),
    path("register/", RegisterView.as_view()),
    path("login/",LoginView.as_view())
]
