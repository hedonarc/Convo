from django.urls import path

from .api.views.conversation import DirectConversationView
from .api.views.message import MessageView

urlpatterns = [
    path("conversations/direct/", DirectConversationView.as_view()),
    path("conversations/<int:conversation_id>/messages/", MessageView.as_view()),
]
