import json
import logging

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer

logger = logging.getLogger(__name__)


class ConversationConsumer(WebsocketConsumer):
    def connect(self):
        self.user = self.scope["user"]

        self.conversation_id = self.scope["url_route"]["kwargs"]["conversation_id"]
        self.room_group_name = f"conversation_{self.conversation_id}"

        # TODO: Check if user can access the conversation

        # Join room group
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name, self.channel_name
        )

        self.accept()

    def disconnect(self, close_code):
        # Leave room group
        if hasattr(self, "room_group_name"):
            async_to_sync(self.channel_layer.group_discard)(
                self.room_group_name, self.channel_name
            )

    # Receive message from WebSocket
    def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            message = text_data_json.get("message")
            if not message:
                return
        except json.JSONDecodeError:
            logger.warning("Invalid JSON received from user %s", self.user.id)
            return

        # Send message to room group
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                "type": "chat.message",
                "message": message,
            },
        )

    # Receive message from room group
    def chat_message(self, event):
        message = event["message"]

        # Send message to WebSocket
        self.send(text_data=json.dumps({"message": message}))
