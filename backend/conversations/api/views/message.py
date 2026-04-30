from rest_framework import status
from rest_framework.views import APIView
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from conversations.models import Conversation, Message
from conversations.permissions import IsConversationParticipant
from conversations.services.message_service import create_message
from conversations.api.serializers.message import (
    MessageSerializer,
    SendMessageSerializer,
)


class MessageView(APIView):
    permission_classes = [IsAuthenticated, IsConversationParticipant]

    def get_conversation(self, conversation_id):
        return get_object_or_404(Conversation, id=conversation_id)

    # Get list of messages of a single conversation
    def get(self, __request__, conversation_id):
        conversation = self.get_conversation(conversation_id)
        messages = Message.objects.filter(conversation=conversation).order_by(
            "created_at"
        )

        return Response(
            MessageSerializer(messages, many=True).data, status=status.HTTP_200_OK
        )

    def post(self, request, conversation_id):
        conversation = self.get_conversation(conversation_id)
        serializer = SendMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        message = create_message(
            conversation=conversation,
            sender=request.user,
            content=serializer.validated_data["content"],
        )

        return Response(MessageSerializer(message).data, status=status.HTTP_201_CREATED)
