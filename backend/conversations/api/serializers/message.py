from rest_framework import serializers
from conversations.models import Message


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = [
            "id",
            "conversation",
            "sender",
            "content",
            "created_at",
            "updated_at",
            "edited_at",
        ]
        read_only_fields = ["id", "sender", "created_at", "updated_at"]


class SendMessageSerializer(serializers.Serializer):
    content = serializers.CharField(required=True, allow_blank=False)
