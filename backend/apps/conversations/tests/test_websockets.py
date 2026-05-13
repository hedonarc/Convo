from asgiref.sync import async_to_sync
from channels.testing import WebsocketCommunicator
from django.contrib.auth import get_user_model
from django.test import TransactionTestCase
from rest_framework_simplejwt.tokens import AccessToken

from apps.conversations.models import Conversation, Participant
from config.asgi import application

User = get_user_model()


class WebSocketAuthTests(TransactionTestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="password")
        self.token = str(AccessToken.for_user(self.user))
        self.conversation = Conversation.objects.create(created_by=self.user)
        Participant.objects.create(user=self.user, conversation=self.conversation)

    def test_connect_authenticated(self):
        """User should successfully connect with a valid JWT token."""

        async def _test():
            communicator = WebsocketCommunicator(
                application,
                f"/ws/conversations/{self.conversation.id}/?token={self.token}",
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
                f"/ws/conversations/{self.conversation.id}/",
            )
            connected, _ = await communicator.connect()

            self.assertFalse(connected)

        async_to_sync(_test)()

    def test_connect_unauthenticated_invalid_token(self):
        """Connection should be rejected if token is invalid."""

        async def _test():
            communicator = WebsocketCommunicator(
                application,
                f"/ws/conversations/{self.conversation.id}/?token=invalid_token",
            )
            connected, _ = await communicator.connect()

            self.assertFalse(connected)

        async_to_sync(_test)()
