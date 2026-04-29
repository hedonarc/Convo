from django.db import models
from django.conf import settings


class Message(models.Model):
    conversation = models.ForeignKey(
        "conversations.Conversation", on_delete=models.CASCADE, related_name="messages"
    )

    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    content = models.TextField()

    is_deleted = models.BooleanField(default=False)
    edited_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
