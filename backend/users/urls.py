from django.urls import path
from users.views import ProtectedView

urlpatterns = [
    path("protected/", ProtectedView.as_view()),
]
