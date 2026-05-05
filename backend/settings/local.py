from .base import *
from .base import BASE_DIR, INSTALLED_APPS, MIDDLEWARE, env

DEBUG = True

SECRET_KEY = env("SECRET_KEY", default="django-insecure-local-key")

ALLOWED_HOSTS = env.list(
    "ALLOWED_HOSTS", default=["localhost", "127.0.0.1", "testserver"]
)
CORS_ALLOWED_ORIGINS = env.list(
    "CORS_ALLOWED_ORIGINS", default=["http://localhost:3000", "http://testserver"]
)

DATABASES = {
    "default": env.db("DATABASE_URL", default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}")
}

# Silkprofiler
SILKY_PYTHON_PROFILER = env.bool("SILKY_PYTHON_PROFILER", default=False)
if SILKY_PYTHON_PROFILER:
    MIDDLEWARE.insert(0, "silk.middleware.SilkyMiddleware")
    if "silk" not in INSTALLED_APPS:
        INSTALLED_APPS.append("silk")
