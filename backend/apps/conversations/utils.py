from django.shortcuts import get_object_or_404

from apps.conversations.models import Conversation, Message


def get_conversation_or_404(conversation_id):
    return get_object_or_404(Conversation, id=conversation_id)


def get_message_or_404(conversation, message_id):
    return get_object_or_404(Message, id=message_id, conversation=conversation)
