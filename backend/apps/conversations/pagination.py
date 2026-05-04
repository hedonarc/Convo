from rest_framework.pagination import CursorPagination, PageNumberPagination


class MessageCursorPagination(CursorPagination):
    page_size = 30
    ordering = "-created_at"


class ConversationCursorPagination(PageNumberPagination):
    page_size = 10
    ordering = "-updated_at"
