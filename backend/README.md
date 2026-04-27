# Backend - Chat Application

This is the backend for the Chat application, built with Django and Django REST Framework.

## Tech Stack

- **Framework:** [Django 6.0+](https://www.djangoproject.com/)
- **API Toolkit:** [Django REST Framework](https://www.django-rest-framework.org/)
- **Package Manager:** [uv](https://github.com/astral-sh/uv)
- **Database:** SQLite (Default)

## Getting Started

### Prerequisites

- [uv](https://github.com/astral-sh/uv) installed on your machine.
- Python 3.13+

### Setup

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies:**

   ```bash
   uv sync
   ```

3. **Run Migrations:**

   ```bash
   uv run manage.py migrate
   ```

4. **Start the Development Server:**
   ```bash
   uv run manage.py runserver
   ```

The server will be available at `http://127.0.0.1:8000/`.

## API Documentation

- **Admin Interface:** `http://127.0.0.1:8000/admin/`

## Project Structure

- `config/`: Project configuration, settings, and root URL routing.
- `manage.py`: Django's command-line utility for administrative tasks.
- `pyproject.toml`: Project metadata and dependencies managed by `uv`.
