from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.conversations.api.serializers.message import (
    MessageSerializer,
    SendOrEditMessageSerializer,
)
from apps.conversations.models import Message
from apps.conversations.pagination import MessageCursorPagination
from apps.conversations.permissions import IsConversationParticipant
from apps.conversations.services.message_service import create_message
from apps.conversations.utils import get_conversation_or_404, get_message_or_404


class MessageView(APIView):
    permission_classes = [IsAuthenticated, IsConversationParticipant]

    def get(self, request, conversation_id):
        """Get list of messages of a single conversation"""
        conversation = get_conversation_or_404(conversation_id)

        messages = Message.objects.filter(conversation=conversation).order_by(
            "-created_at"
        )

        paginator = MessageCursorPagination()

        paginated_messages = paginator.paginate_queryset(messages, request, view=self)

        serializer = MessageSerializer(paginated_messages, many=True)

        return paginator.get_paginated_response(serializer.data)

    def post(self, request, conversation_id):
        conversation = get_conversation_or_404(conversation_id)
        serializer = SendOrEditMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        message = create_message(
            conversation=conversation,
            sender=request.user,
            content=serializer.validated_data["content"],
        )

        return Response(MessageSerializer(message).data, status=status.HTTP_201_CREATED)

    def patch(self, request, conversation_id, message_id):
        conversation = get_conversation_or_404(conversation_id)
        message = get_message_or_404(conversation, message_id)

        self.check_object_permissions(request, message)

        serializer = SendOrEditMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Adding previous message to prev_content and saving new message to content
        new_content = serializer.validated_data["content"]

        if not new_content.strip():
            return Response(
                {"error": "Cannot edit message with empty content"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        message.prev_content = message.content
        message.content = new_content
        message.edited_at = timezone.now()
        message.save(update_fields=["prev_content", "content", "edited_at"])

        return Response(MessageSerializer(message).data, status=status.HTTP_200_OK)

    def delete(self, request, conversation_id, message_id):
        conversation = get_conversation_or_404(conversation_id)
        message = get_message_or_404(conversation, message_id)

        self.check_object_permissions(request, message)

        # soft delete logic
        message.prev_content = message.content
        message.content = ""
        message.is_deleted = True
        message.deleted_at = timezone.now()
        message.save(
            update_fields=["prev_content", "content", "is_deleted", "deleted_at"]
        )

        return Response({"message": "Message deleted"}, status=status.HTTP_200_OK)
