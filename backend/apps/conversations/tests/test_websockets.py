from asgiref.sync import async_to_sync
from channels.testing import WebsocketCommunicator
from django.contrib.auth.models import User
from django.test import TransactionTestCase
from rest_framework_simplejwt.tokens import AccessToken

from config.asgi import application


class WebSocketAuthTests(TransactionTestCase):
    def test_connect_authenticated(self):
        """User should successfully connect with a valid JWT token."""
        user = User.objects.create_user(username="testuser", password="password")
        token = str(AccessToken.for_user(user))  # IMPORTANT: cast to string

        async def _test():
            communicator = WebsocketCommunicator(
                application,
                f"/ws/conversations/1/?token={token}",
            )
            connected, _ = await communicator.connect()

            self.assertTrue(connected)
            self.assertEqual(communicator.scope["user"].username, "testuser")

            await communicator.disconnect()

        async_to_sync(_test)()

    def test_connect_unauthenticated_no_token(self):
        """Connection should be rejected if no token is provided."""

        async def _test():
            communicator = WebsocketCommunicator(
                application,
                "/ws/conversations/1/",
            )
            connected, _ = await communicator.connect()

            self.assertFalse(connected)

        async_to_sync(_test)()

    def test_connect_unauthenticated_invalid_token(self):
        """Connection should be rejected if token is invalid."""

        async def _test():
            communicator = WebsocketCommunicator(
                application,
                "/ws/conversations/1/?token=invalid_token",
            )
            connected, _ = await communicator.connect()

            self.assertFalse(connected)

        async_to_sync(_test)()
