# Backend Setup

The Convo backend is built with Django and Django REST Framework, using `uv` for dependency management.

## Prerequisites

- Install Python 3.13
- Install [`uv`](https://github.com/astral-sh/uv) 

## Installation

Run from `backend/`:

```bash
uv sync
cp .env.example .env
uv run manage.py migrate
uv run manage.py setup_admin
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
