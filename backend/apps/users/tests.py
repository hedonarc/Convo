from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken


class UsersApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="owner",
            email="owner@example.com",
            password="OwnerPass123!",
            first_name="Owner",
            last_name="User",
        )
        self.other_user = User.objects.create_user(
            username="johnny",
            email="john@example.com",
            password="OtherPass123!",
            first_name="John",
            last_name="Doe",
        )
        self.users_list_url = "/api/users/"
        self.user_detail_url = f"/api/users/{self.other_user.id}"

    def _authenticate(self, user):
        refresh = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

    def test_users_list_requires_authentication(self):
        """Return 401 when requesting the users list without a JWT."""
        response = self.client.get(self.users_list_url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_users_list_returns_users_for_authenticated_user(self):
        """Return all users when an authenticated user requests the list."""
        self._authenticate(self.user)

        response = self.client.get(self.users_list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertTrue(any(item["username"] == "owner" for item in response.data))
        self.assertTrue(any(item["username"] == "johnny" for item in response.data))

    def test_users_list_supports_search(self):
        """Filter users by search query across user fields."""
        self._authenticate(self.user)

        response = self.client.get(self.users_list_url, {"search": "john"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["username"], "johnny")

    def test_user_detail_returns_user_data(self):
        """Return target user details for an authenticated request."""
        self._authenticate(self.user)

        response = self.client.get(self.user_detail_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], self.other_user.id)
        self.assertEqual(response.data["username"], "johnny")

    def test_user_detail_returns_not_found_for_unknown_user(self):
        """Return 404 when requesting a user id that does not exist."""
        self._authenticate(self.user)

        response = self.client.get("/api/users/9999")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["message"], "User not found")

    def test_patch_user_updates_names_and_password(self):
        """Update first name, last name, and password via PATCH."""
        self._authenticate(self.user)
        payload = {
            "first_name": "Jane",
            "last_name": "Smith",
            "password": "UpdatedPass123!",
        }

        response = self.client.patch(self.user_detail_url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.other_user.refresh_from_db()
        self.assertEqual(self.other_user.first_name, "Jane")
        self.assertEqual(self.other_user.last_name, "Smith")
        self.assertTrue(self.other_user.check_password("UpdatedPass123!"))
        self.assertEqual(response.data["message"], "User updated")

    def test_delete_user_removes_user(self):
        """Delete the target user and confirm it is removed."""
        self._authenticate(self.user)

        response = self.client.delete(self.user_detail_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(User.objects.filter(id=self.other_user.id).exists())
        self.assertEqual(response.data["message"], "User deleted")
