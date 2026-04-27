# Backend - Chat Application

This is the backend for the Chat application, built with Django and Django REST Framework.

## Tech Stack

- **Framework:** [Django 6.0+](https://www.djangoproject.com/)
- **API Toolkit:** [Django REST Framework](https://www.django-rest-framework.org/)
- **Package Manager:** [uv](https://github.com/astral-sh/uv)
- **Linting & Formatting:** [Ruff](https://docs.astral.sh/ruff/)
- **Database:** SQLite (Default)

## Getting Started

### Prerequisites

- [uv](https://github.com/astral-sh/uv) installed on your machine  
- Python 3.13+

### Setup

1. Clone the repository:
   git clone <repository-url>
   cd backend

2. Install dependencies:
   uv sync

3. Run migrations:
   uv run manage.py migrate

4. Create admin user:
   uv run manage.py setup_admin

5. Start the development server:
   uv run manage.py runserver

The server will be available at:
http://127.0.0.1:8000/

## Code Quality (Ruff)

We use Ruff for fast linting and formatting.

Run linter:
uv run ruff check .

Auto-fix issues:
uv run ruff check . --fix

Format code:
uv run ruff format .

Ruff helps:
- Detect code issues
- Fix unused imports/variables
- Enforce consistent style
- Replace flake8, black, isort

## API Documentation

- Admin Interface: http://127.0.0.1:8000/admin/

## Project Structure

- config/: Project settings and root URL routing
- manage.py: Django command-line utility
- pyproject.toml: Dependencies managed by uv
- apps/: Application modules (e.g. users, chat)