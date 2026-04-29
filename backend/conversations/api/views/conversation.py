from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from conversations.services.conversation_service import (
    get_or_create_direct_conversation,
)


class DirectConversationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user1 = request.user
        user2_id = request.data.get("user_id")

        if not user2_id:
            return Response({"error": "user_id required"}, status=400)

        from django.contrib.auth import get_user_model

        User = get_user_model()

        try:
            user2 = User.objects.get(id=user2_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        convo = get_or_create_direct_conversation(user1, user2)

        return Response({"conversation_id": convo.id})
