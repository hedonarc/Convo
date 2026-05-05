from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


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
        results = response.data["results"]
        self.assertEqual(len(results), 2)
        self.assertTrue(any(item["username"] == "owner" for item in results))
        self.assertTrue(any(item["username"] == "johnny" for item in results))

    def test_users_list_supports_search(self):
        """Filter users by search query across user fields."""
        self._authenticate(self.user)

        response = self.client.get(self.users_list_url, {"search": "john"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data["results"]
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["username"], "johnny")

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
        """Update first name, last name, and password via PATCH for OWN account."""
        self._authenticate(self.other_user)  # Authenticate as the user being updated
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

    def test_patch_other_user_returns_forbidden(self):
        """Return 403 when trying to update another user's profile."""
        self._authenticate(self.user)  # Authenticate as 'owner'
        payload = {"first_name": "Hacker"}

        response = self.client.patch(self.user_detail_url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_user_removes_user(self):
        """Delete OWN account and confirm it is removed."""
        self._authenticate(self.other_user)  # Authenticate as the user being deleted

        response = self.client.delete(self.user_detail_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        User = get_user_model()
        self.assertFalse(User.objects.filter(id=self.other_user.id).exists())
        self.assertEqual(response.data["message"], "User deleted")

    def test_delete_other_user_returns_forbidden(self):
        """Return 403 when trying to delete another user's account."""
        self._authenticate(self.user)  # Authenticate as 'owner'

        response = self.client.delete(self.user_detail_url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        User = get_user_model()
        self.assertTrue(User.objects.filter(id=self.other_user.id).exists())
