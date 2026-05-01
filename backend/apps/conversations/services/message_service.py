from apps.conversations.models import Message


def create_message(conversation, sender, content):
    message = Message.objects.create(
        conversation=conversation, sender=sender, content=content
    )

    # 🔥 update conversation last message pointer
    conversation.last_message_id = message.id
    conversation.save(update_fields=["last_message_id", "updated_at"])

    return message
