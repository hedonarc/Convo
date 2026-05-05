from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class AuthApiTests(APITestCase):
    def setUp(self):
        self.register_url = "/api/register/"
        self.login_url = "/api/login/"
        self.password = "StrongPass123!"
        self.user = User.objects.create_user(
            username="existing_user",
            email="existing@example.com",
            password=self.password,
            first_name="Existing",
            last_name="User",
        )

    def test_register_creates_user_and_returns_token(self):
        """Create a new user and return JWT tokens on register."""
        payload = {
            "username": "new_user",
            "email": "new@example.com",
            "password": "BrandNewPass123!",
            "confirm_password": "BrandNewPass123!",
            "first_name": "New",
            "last_name": "User",
        }

        response = self.client.post(self.register_url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["message"], "You are registered")
        self.assertIn("token", response.data)
        self.assertIn("refresh", response.data["token"])
        self.assertIn("access", response.data["token"])
        self.assertEqual(response.data["user"]["username"], "new_user")
        self.assertTrue(User.objects.filter(username="new_user").exists())

    def test_register_rejects_duplicate_email(self):
        """Reject registration when the email is already in use."""
        payload = {
            "username": "another_user",
            "email": "existing@example.com",
            "password": "BrandNewPass123!",
            "confirm_password": "BrandNewPass123!",
        }

        response = self.client.post(self.register_url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Email already exists", response.data["email"])

    def test_register_rejects_password_mismatch(self):
        """Reject registration when password confirmation does not match."""
        payload = {
            "username": "another_user",
            "email": "another@example.com",
            "password": "BrandNewPass123!",
            "confirm_password": "DifferentPass123!",
        }

        response = self.client.post(self.register_url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Passwords do not match", response.data["non_field_errors"])

    def test_login_with_username_returns_token(self):
        """Authenticate with username and return JWT tokens."""
        payload = {"username": "existing_user", "password": self.password}

        response = self.client.post(self.login_url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "You are logged in.")
        self.assertEqual(response.data["user"]["username"], "existing_user")
        self.assertIn("token", response.data)
        self.assertIn("access", response.data["token"])

    def test_login_with_email_returns_token(self):
        """Authenticate with email and return JWT tokens."""
        payload = {"username": "existing@example.com", "password": self.password}

        response = self.client.post(self.login_url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["user"]["email"], "existing@example.com")
        self.assertIn("token", response.data)

    def test_login_with_invalid_credentials_fails(self):
        """Return 400 when credentials are invalid during login."""
        payload = {"username": "existing_user", "password": "WrongPass123!"}

        response = self.client.post(self.login_url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Invalid credentials", response.data["non_field_errors"])
