import json
import logging

from channels.generic.websocket import AsyncWebsocketConsumer

from apps.conversations.api.serializers.message import MessageSerializer
from apps.conversations.constants import MAX_MESSAGE_LENGTH
from apps.conversations.queries import (
    db_create_message,
    get_conversation_for_user,
    message_belongs_to_conversation,
    update_read_receipt,
)

logger = logging.getLogger(__name__)


class ConversationConsumer(AsyncWebsocketConsumer):
    # Mapping of client-sent action names → handler method names.
    # Built once at class definition time instead of on every incoming frame.
    ACTION_HANDLERS = {
        "send_message": "handle_send_message",
        "typing": "handle_typing",
        "read": "handle_read_receipt",
    }

    # -------------------------------------------------------------------------
    # Connection Lifecycle
    # -------------------------------------------------------------------------

    async def connect(self):
        self.user = self.scope["user"]
        self.conversation_id = self.scope["url_route"]["kwargs"]["conversation_id"]

        # Defensive guard — JWTAuthMiddleware already blocks anonymous users
        # before reaching this point, but we keep this as an explicit safety net.
        if not self.user.is_authenticated:
            await self.close(code=4001)
            return

        # Authorization — user must be a participant in the conversation.
        self.conversation = await get_conversation_for_user(
            self.user, self.conversation_id
        )
        if self.conversation is None:
            logger.warning(
                "Access denied: User %s not in conversation %s",
                self.user.id,
                self.conversation_id,
            )
            await self.close(code=4003)
            return

        self.room_group_name = f"conversation_{self.conversation_id}"

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        logger.info(
            "WebSocket connected: user %s joined conversation %s",
            self.user.id,
            self.conversation_id,
        )

    async def disconnect(self, close_code):
        if hasattr(self, "room_group_name"):
            await self.channel_layer.group_discard(
                self.room_group_name, self.channel_name
            )
            logger.info(
                "WebSocket disconnected: user %s left conversation %s (code=%s)",
                self.user.id,
                self.conversation_id,
                close_code,
            )

    # -------------------------------------------------------------------------
    # Incoming Message Dispatcher
    # -------------------------------------------------------------------------

    async def receive(self, text_data):
        """
        Parse incoming frames and route to the appropriate action handler.

        Expected payload schema:
            { "action": "<action_name>", "data": { ... } }
        """
        try:
            payload = json.loads(text_data)
            action = payload.get("action")
            data = payload.get("data", {})
        except (json.JSONDecodeError, AttributeError):
            await self.send_error("Invalid JSON format")
            return

        handler_name = self.ACTION_HANDLERS.get(action)
        if handler_name:
            await getattr(self, handler_name)(data)
        else:
            await self.send_error(f"Unknown action: {action!r}")

    # -------------------------------------------------------------------------
    # Action Handlers
    # -------------------------------------------------------------------------

    async def handle_send_message(self, data: dict):
        """
        Persist a new message to the DB then broadcast it to the room group.
        """
        content = data.get("content", "").strip()
        if not content:
            await self.send_error("Message content cannot be empty")
            return

        if len(content) > MAX_MESSAGE_LENGTH:
            await self.send_error(
                f"Message exceeds the maximum length of {MAX_MESSAGE_LENGTH} characters"
            )
            return

        message = await db_create_message(self.conversation, self.user, content)

        # MessageSerializer gives us a consistent payload identical to the REST API.
        message_data = dict(MessageSerializer(message).data)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message_event",
                "message": message_data,
            },
        )

    async def handle_typing(self, data: dict):
        """
        Broadcast a typing indicator to all other participants in the room.
        """
        is_typing = bool(data.get("is_typing", True))

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "typing_event",
                "user_id": self.user.id,
                "is_typing": is_typing,
            },
        )

    async def handle_read_receipt(self, data: dict):
        """
        Mark a message as read for this user and broadcast the receipt to the group.

        Validates that:
        - message_id is a positive integer
        - the message exists and belongs to this conversation (prevents marking
          arbitrary or cross-conversation IDs as read)
        """
        message_id = data.get("message_id")
        if not isinstance(message_id, int) or message_id <= 0:
            await self.send_error("A valid integer message_id is required")
            return

        message_exists = await message_belongs_to_conversation(
            self.conversation, message_id
        )
        if not message_exists:
            await self.send_error("Message not found in this conversation")
            return

        await update_read_receipt(self.user, self.conversation, message_id)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "read_event",
                "user_id": self.user.id,
                "message_id": message_id,
            },
        )

    # -------------------------------------------------------------------------
    # Group Event Handlers
    # These methods are invoked by the channel layer when a group_send message
    # arrives. The method name must match the "type" key (dots → underscores).
    # -------------------------------------------------------------------------

    async def chat_message_event(self, event):
        """Deliver a new message to the connected WebSocket client."""
        await self.send(
            text_data=json.dumps({"type": "new_message", "data": event["message"]})
        )

    async def typing_event(self, event):
        """Deliver a typing indicator to the connected WebSocket client.

        Skipped for the sender — a user does not need to receive
        their own typing indicator back.
        """
        if event["user_id"] == self.user.id:
            return

        await self.send(
            text_data=json.dumps(
                {
                    "type": "typing",
                    "data": {
                        "user_id": event["user_id"],
                        "is_typing": event["is_typing"],
                    },
                }
            )
        )

    async def read_event(self, event):
        """Deliver a read receipt to the connected WebSocket client."""
        await self.send(
            text_data=json.dumps(
                {
                    "type": "read_receipt",
                    "data": {
                        "user_id": event["user_id"],
                        "message_id": event["message_id"],
                    },
                }
            )
        )

    # -------------------------------------------------------------------------
    # Utilities
    # -------------------------------------------------------------------------

    async def send_error(self, message: str):
        """Send a structured error frame to the connected client."""
        await self.send(text_data=json.dumps({"type": "error", "message": message}))
