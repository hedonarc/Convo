from django.conf import settings
from django.db import models


class Conversation(models.Model):
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="created_conversations",
    )
    conversation_key = models.CharField(
        max_length=255, unique=True, null=True, blank=True
    )

    # TODO: @msulemanb Replace biginteger with foreign key to Message model
    #       because `last_message_id` can point to:
    #           - a soft deleted message
    #           - a message that is not part of the conversation (logic bug)
    #           - non-existent message (database corruption)
    #       This will transfer responsibility of message existence check
    #       to the database
    last_message_id = models.BigIntegerField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.created_by} - {self.conversation_key or self.id}"
