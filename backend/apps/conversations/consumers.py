import json
import logging

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

from apps.conversations.api.serializers.message import MessageSerializer
from apps.conversations.models import Message, Participant
from apps.conversations.services.message_service import create_message

logger = logging.getLogger(__name__)

MAX_MESSAGE_LENGTH = 4096  # characters


class ConversationConsumer(AsyncWebsocketConsumer):
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
        self.conversation = await self._get_conversation_for_user(
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

        handlers = {
            "send_message": self.handle_send_message,
            "typing": self.handle_typing,
            "read": self.handle_read_receipt,
        }

        handler = handlers.get(action)
        if handler:
            await handler(data)
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

        message = await self._create_message(content)

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

        message_exists = await self._message_belongs_to_conversation(message_id)
        if not message_exists:
            await self.send_error("Message not found in this conversation")
            return

        await self._update_read_receipt(message_id)

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
    # Database Helpers
    # All ORM operations must be wrapped with @database_sync_to_async to avoid
    # blocking the asyncio event loop.
    # -------------------------------------------------------------------------

    @database_sync_to_async
    def _get_conversation_for_user(self, user, conversation_id):
        """
        Return the Conversation instance if the user is a participant,
        otherwise return None.
        """
        try:
            participant = Participant.objects.select_related("conversation").get(
                user=user, conversation_id=conversation_id
            )
            return participant.conversation
        except Participant.DoesNotExist:
            return None

    @database_sync_to_async
    def _create_message(self, content: str):
        """
        Persist a new Message and update the conversation's last_message pointer.
        Delegates to the shared message_service to keep business logic consistent
        with the REST API.
        """
        return create_message(self.conversation, self.user, content)

    @database_sync_to_async
    def _message_belongs_to_conversation(self, message_id: int) -> bool:
        """
        Return True only if the message exists, belongs to this conversation,
        and has not been deleted. Prevents users from marking arbitrary or
        cross-conversation message IDs as read.
        """
        return Message.objects.filter(
            id=message_id,
            conversation=self.conversation,
            is_deleted=False,
        ).exists()

    @database_sync_to_async
    def _update_read_receipt(self, message_id: int):
        """Update the participant's last_read_message_id."""
        Participant.objects.filter(
            user=self.user, conversation=self.conversation
        ).update(last_read_message_id=message_id)

    # -------------------------------------------------------------------------
    # Utilities
    # -------------------------------------------------------------------------

    async def send_error(self, message: str):
        """Send a structured error frame to the connected client."""
        await self.send(text_data=json.dumps({"type": "error", "message": message}))
