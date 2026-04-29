from django.urls import path
from .api.views.conversation import DirectConversationView
from .api.views.message import SendMessageView, MessageListView

urlpatterns = [
    path("conversations/direct/", DirectConversationView.as_view()),
    # 💬 send message
    path("conversations/<int:conversation_id>/messages/", SendMessageView.as_view()),
    path(
        "conversations/<int:conversation_id>/messages/list/", MessageListView.as_view()
    ),
]
