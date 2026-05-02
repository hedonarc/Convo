from django.contrib import admin

from apps.conversations.models import Conversation, Message, Participant


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ["id", "conversation_key", "created_at", "updated_at"]
    list_filter = ["created_at", "updated_at"]
    search_fields = ["conversation_key"]
    ordering = ["-created_at"]


@admin.register(Participant)
class ParticipantAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "conversation"]
    search_fields = ["user__username", "conversation__conversation_key"]


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ["id", "content", "sender", "conversation"]
    list_filter = ["created_at", "updated_at"]
    search_fields = ["content", "sender__username", "conversation__conversation_key"]
    ordering = ["-created_at"]
