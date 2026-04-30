from conversations.models import Conversation
from rest_framework import serializers


class ConversationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conversation
        fields = "__all__"
