from django.conf import settings
from django.db import models


class Message(models.Model):
    conversation = models.ForeignKey(
        "conversations.Conversation", on_delete=models.CASCADE, related_name="messages"
    )

    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    content = models.TextField(blank=True)
    prev_content = models.TextField(blank=True)
    edited_at = models.DateTimeField(null=True, blank=True)

    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.sender} - {self.content[:20]}..."
