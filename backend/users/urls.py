from django.urls import path
from users.views import ProtectedView
from users.views import RegisterView

urlpatterns = [
    path("protected/", ProtectedView.as_view()),
    path("register/", RegisterView.as_view()),
]
