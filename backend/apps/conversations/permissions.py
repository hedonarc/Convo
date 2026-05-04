from rest_framework.exceptions import NotFound
from rest_framework.permissions import BasePermission

from apps.conversations.models import Conversation, Participant
from utils.translations import t


class IsConversationParticipant(BasePermission):
    def has_permission(self, request, view):
        conversation_id = view.kwargs.get("conversation_id")

        # 🔥 First check if conversation exists
        if not Conversation.objects.filter(id=conversation_id).exists():
            raise NotFound(detail=t("conversations.not_found"), code=404)

        return Participant.objects.filter(
            conversation_id=conversation_id, user=request.user
        ).exists()

    def has_object_permission(self, request, __view__, obj):
        # obj = Message instance (or whatever object you're protecting

        # if user trying to delete/edit a deleted message
        # returns false if user is trying to edit someone else's message
        if request.method in ["PATCH", "DELETE"]:
            return obj.sender == request.user and not obj.is_deleted

        return True
