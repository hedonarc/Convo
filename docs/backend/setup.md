# Backend Setup

The Convo backend is built with Django and Django REST Framework, using `uv` for dependency management.

## Prerequisites

- Install Python 3.13
- Install [`uv`](https://github.com/astral-sh/uv) 
- Install **Redis** (v6.0 or higher) - Required for WebSockets.

## Installation

Run from `backend/`:

1. **Install dependencies:**
   ```bash
   uv sync
   ```

2. **Setup environment:**
   ```bash
   cp .env.example .env
   ```

3. **Start Redis:**
   Ensure a Redis server is running. If you have Docker:
   ```bash
   docker run -p 6379:6379 -d redis
   ```
   Or start it locally via your OS service manager (e.g., `brew services start redis`).

4. **Initialize database & admin:**
   ```bash
   uv run manage.py migrate
   uv run manage.py setup_admin
   ```

5. **Run the server:**
   ```bash
   uv run manage.py runserver
   ```

## Environment Variables

The `.env.example` file contains all required variables. After copying it to `.env`, fill in the values:

| Variable | Description | How to get it |
|----------|-------------|---------------|
| `SECRET_KEY` | Django secret key | Generate one (see below) or ask a teammate for the shared dev key |

### Generating a `SECRET_KEY`

```bash
uv run python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

> **Note:** For local development, any generated key works. For staging/production, each environment must have its own unique secret key — never share or reuse production keys.

API base URL: `http://127.0.0.1:8000/`
