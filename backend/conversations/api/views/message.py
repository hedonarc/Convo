from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, BasePermission

from conversations.models import Conversation, Message, Participant
from conversations.services.message_service import create_message
from conversations.api.serializers.message import MessageSerializer


class SendMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, conversation_id):
        content = request.data.get("content")

        if not content:
            return Response({"error": "content required"}, status=400)

        try:
            conversation = Conversation.objects.get(id=conversation_id)
        except Conversation.DoesNotExist:
            return Response({"error": "Conversation not found"}, status=404)

        # 🔒 check user is participant
        is_member = Participant.objects.filter(
            conversation=conversation, user=request.user
        ).exists()

        if not is_member:
            return Response({"error": "Not allowed"}, status=403)

        message = create_message(
            conversation=conversation, sender=request.user, content=content
        )

        return Response(MessageSerializer(message).data)


class IsConversationParticipant(BasePermission):
    def has_permission(self, request, view):
        conversation_id = view.kwargs.get("conversation_id")

        return Participant.objects.filter(
            conversation_id=conversation_id, user=request.user
        ).exists()


class MessageListView(ListAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated, IsConversationParticipant]

    def get_queryset(self):
        conversation_id = self.kwargs["conversation_id"]

        # # 🔒 access check
        # if not Participant.objects.filter(
        #     conversation_id=conversation_id,
        #     user=self.request.user
        # ).exists():
        #     return Message.objects.none()

        return Message.objects.filter(
            conversation_id=conversation_id, is_deleted=False
        ).order_by("-created_at")
