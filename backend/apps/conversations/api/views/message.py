from rest_framework import status
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.conversations.api.serializers.message import (
    MessageSerializer,
    SendMessageSerializer,
)
from apps.conversations.models import Conversation, Message
from apps.conversations.pagination import MessageCursorPagination
from apps.conversations.permissions import IsConversationParticipant
from apps.conversations.services.message_service import create_message


class MessageView(APIView):
    permission_classes = [IsAuthenticated, IsConversationParticipant]

    def get_conversation(self, conversation_id):
        return get_object_or_404(Conversation, id=conversation_id)

    # TODO: @msulemanb exclude soft deleted messages from this list (in future)
    def get(self, request, conversation_id):
        """Get list of messages of a single conversation"""
        conversation = self.get_conversation(conversation_id)

        messages = Message.objects.filter(conversation=conversation).order_by(
            "-created_at"
        )

        paginator = MessageCursorPagination()

        paginated_messages = paginator.paginate_queryset(messages, request, view=self)

        serializer = MessageSerializer(paginated_messages, many=True)

        return paginator.get_paginated_response(serializer.data)

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
