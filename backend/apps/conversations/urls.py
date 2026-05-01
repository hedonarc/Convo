from django.urls import path

from .api.views.conversation import ConversationView
from .api.views.message import MessageView

urlpatterns = [
    path("conversations/", ConversationView.as_view()),
    path("conversations/<int:conversation_id>/messages/", MessageView.as_view()),
]
