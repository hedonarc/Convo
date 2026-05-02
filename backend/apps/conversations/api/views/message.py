from django.utils import timezone
from rest_framework import status
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.conversations.api.serializers.message import (
    MessageSerializer,
    SendOrEditMessageSerializer,
)
from apps.conversations.models import Conversation, Message
from apps.conversations.pagination import MessageCursorPagination
from apps.conversations.permissions import IsConversationParticipant
from apps.conversations.services.message_service import create_message


class MessageView(APIView):
    permission_classes = [IsAuthenticated, IsConversationParticipant]

    def get_conversation(self, conversation_id):
        return get_object_or_404(Conversation, id=conversation_id)

    def get_message(self, conversation, message_id):
        return get_object_or_404(Message, id=message_id, conversation=conversation)

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
        serializer = SendOrEditMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        message = create_message(
            conversation=conversation,
            sender=request.user,
            content=serializer.validated_data["content"],
        )

        return Response(MessageSerializer(message).data, status=status.HTTP_201_CREATED)

    def patch(self, request, conversation_id, message_id):
        # return Response(str(request))

        conversation = self.get_conversation(conversation_id)
        message = self.get_message(conversation, message_id)

        self.check_object_permissions(request, message)

        serializer = SendOrEditMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Adding previous message to prev_content and saving new message to content
        new_content = serializer.validated_data["content"]

        message.prev_content = message.content
        message.content = new_content
        message.edited_at = timezone.now()
        message.save()

        return Response(MessageSerializer(message).data, status=status.HTTP_200_OK)

    def delete(self, request, conversation_id, message_id):
        conversation = self.get_conversation(conversation_id)
        message = self.get_message(conversation, message_id)

        self.check_object_permissions(request, message)

        # soft delete logic
        message.prev_content = message.content
        message.content = ""
        message.is_deleted = True
        message.deleted_at = timezone.now()
        message.save()

        return Response({"message": "Message deleted"}, status=status.HTTP_200_OK)
