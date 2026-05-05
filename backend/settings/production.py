from .base import *
from .base import env

DEBUG = False

# Strict secrets - no defaults
SECRET_KEY = env("SECRET_KEY")

DATABASES = {"default": env.db("DATABASE_URL")}

ALLOWED_HOSTS = env.list("ALLOWED_HOSTS")
CORS_ALLOWED_ORIGINS = env.list("CORS_ALLOWED_ORIGINS")

# Strict security settings
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000  # 1 year
