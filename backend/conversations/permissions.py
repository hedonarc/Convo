from rest_framework.exceptions import NotFound
from rest_framework.permissions import BasePermission
from users.translations import t

from conversations.models import Conversation, Participant


class IsConversationParticipant(BasePermission):
    def has_permission(self, request, view):
        conversation_id = view.kwargs.get("conversation_id")

        # 🔥 First check if conversation exists
        if not Conversation.objects.filter(id=conversation_id).exists():
            raise NotFound(detail=t("conversations.not_found"), code=404)

        return Participant.objects.filter(
            conversation_id=conversation_id, user=request.user
        ).exists()
