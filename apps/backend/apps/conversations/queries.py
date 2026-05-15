"""
Async-safe database query helpers for the conversations app.

Each function is wrapped with @database_sync_to_async so it can be awaited
from an AsyncWebsocketConsumer (or any async context) without blocking the
asyncio event loop.

Keeping these at module level rather than as consumer methods makes them:
  - Reusable across multiple consumers / views
  - Straightforward to unit-test with plain pytest (no consumer setup needed)
"""

from channels.db import database_sync_to_async

from apps.conversations.models import Message, Participant
from apps.conversations.services.message_service import create_message


@database_sync_to_async
def get_conversation_for_user(user, conversation_id):
    """
    Return the Conversation instance if *user* is an active participant,
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
def db_create_message(conversation, user, content: str):
    """
    Persist a new Message and update the conversation's last_message pointer.
    Delegates to the shared message_service to keep business logic consistent
    with the REST API.
    """
    return create_message(conversation, user, content)


@database_sync_to_async
def message_belongs_to_conversation(conversation, message_id: int) -> bool:
    """
    Return True only if the message exists, belongs to *conversation*,
    and has not been soft-deleted.  Prevents users from marking arbitrary or
    cross-conversation message IDs as read.
    """
    return Message.objects.filter(
        id=message_id,
        conversation=conversation,
        is_deleted=False,
    ).exists()


@database_sync_to_async
def update_read_receipt(user, conversation, message_id: int) -> None:
    """Update the participant's last_read_message_id to *message_id*."""
    Participant.objects.filter(user=user, conversation=conversation).update(
        last_read_message_id=message_id
    )
