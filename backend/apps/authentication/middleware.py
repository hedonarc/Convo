from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken

User = get_user_model()


@database_sync_to_async
def get_user(token_key):
    try:
        token = AccessToken(token_key)
        user_id = token["user_id"]
        return User.objects.get(id=user_id)
    except Exception:
        return AnonymousUser()


class JWTAuthMiddleware:
    """
    Authenticate WebSocket connections using JWT token in query string.
    Rejects connection if token is missing or invalid.
    """

    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        query_string = scope.get("query_string", b"").decode()
        query_params = parse_qs(query_string)

        token_list = query_params.get("token")
        token_key = token_list[0] if token_list else None

        if not token_key:
            # ❌ Reject connection immediately
            await send(
                {
                    "type": "websocket.close",
                    "code": 4001,
                }
            )
            return

        user = await get_user(token_key)

        if user.is_anonymous:
            # ❌ Reject invalid token
            await send(
                {
                    "type": "websocket.close",
                    "code": 4002,
                }
            )
            return

        # ✅ Authenticated
        scope["user"] = user

        return await self.inner(scope, receive, send)


def JWTAuthMiddlewareStack(inner):
    return JWTAuthMiddleware(inner)
