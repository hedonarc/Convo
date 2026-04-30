from rest_framework import serializers
from conversations.models import Conversation


class ConversationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conversation
        fields = "__all__"
