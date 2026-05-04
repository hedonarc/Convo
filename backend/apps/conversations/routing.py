from django.urls import re_path

from apps.conversations.consumers import ConversationConsumer

websocket_urlpatterns = [
    re_path(
        r"ws/conversations/(?P<conversation_id>[^/]+)/$", ConversationConsumer.as_asgi()
    ),
]
