from apps.conversations.models import Message


# TODO: @msulemanb For improvement wrap this function in a transaction
#       So if message creation fails,
#       the conversation last message pointer is not updated
def create_message(conversation, sender, content):
    message = Message.objects.create(
        conversation=conversation, sender=sender, content=content
    )

    # 🔥 update conversation last message pointer
    conversation.last_message = message
    conversation.save(update_fields=["last_message", "updated_at"])

    return message
