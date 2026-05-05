from .base import *

DEBUG = False

SECRET_KEY = "django-insecure-test-key-for-testing"

# Hardcoded for tests
ALLOWED_HOSTS = ["localhost", "127.0.0.1", "testserver", "*"]
CORS_ALLOW_ALL_ORIGINS = True

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": ":memory:",
    }
}

PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.MD5PasswordHasher",
]

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.dummy.DummyCache",
    }
}

EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
