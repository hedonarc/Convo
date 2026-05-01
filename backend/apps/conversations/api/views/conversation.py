from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.conversations.api.serializers.conversation import ConversationSerializer
from apps.conversations.services.conversation_service import (
    get_or_create_direct_conversation,
)


class DirectConversationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user1 = request.user
        user2_id = request.data.get("user_id")

        if not user2_id:
            return Response(
                {"error": "user_id required"}, status=status.HTTP_400_BAD_REQUEST
            )

        User = get_user_model()

        user2 = get_object_or_404(User, id=user2_id)

        convo, is_created = get_or_create_direct_conversation(user1, user2)

        return Response(
            data={
                "conversation": ConversationSerializer(convo).data,
                "is_created": is_created,
            },
            status=status.HTTP_201_CREATED if is_created else status.HTTP_200_OK,
        )
