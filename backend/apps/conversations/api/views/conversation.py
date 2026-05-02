from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.conversations.api.serializers.conversation import ConversationSerializer
from apps.conversations.models import Conversation
from apps.conversations.pagination import ConversationCursorPagination
from apps.conversations.services.conversation_service import (
    get_or_create_direct_conversation,
)


class ConversationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        conversations = Conversation.objects.filter(
            participant__user=user
        ).select_related("last_message")

        paginator = ConversationCursorPagination()
        paginated_conversations = paginator.paginate_queryset(
            conversations, request, view=self
        )

        serializer = ConversationSerializer(paginated_conversations, many=True)

        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        sender = request.user
        recipient_id = request.data.get("user_id")

        if not recipient_id:
            return Response(
                {"error": "user_id required"}, status=status.HTTP_400_BAD_REQUEST
            )

        User = get_user_model()

        recipient = get_object_or_404(User, id=recipient_id)

        conversation, is_created = get_or_create_direct_conversation(sender, recipient)

        return Response(
            data={
                "conversation": ConversationSerializer(conversation).data,
                "is_created": is_created,
            },
            status=status.HTTP_201_CREATED if is_created else status.HTTP_200_OK,
        )
