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

    last_message = models.ForeignKey(
        "conversations.Message",  # string reference (avoids circular import)
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="+",  # no reverse relation needed
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return f"{self.created_by} - {self.conversation_key or self.id}"
