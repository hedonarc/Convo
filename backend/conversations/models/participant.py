from django.conf import settings
from django.db import models


class Participant(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    conversation = models.ForeignKey(
        "conversations.Conversation", on_delete=models.CASCADE
    )

    joined_at = models.DateTimeField(auto_now_add=True)
    last_read_message_id = models.BigIntegerField(null=True, blank=True)

    class Meta:
        unique_together = ("user", "conversation")
