# ⚙️ Convo Backend API

The backend for Convo is built with **Django 6.0+** and **Django REST Framework**, using **uv** for high-performance dependency management.

---

## 🚀 Tech Stack

- **Framework:** [Django 6.0+](https://www.djangoproject.com/)
- **API Toolkit:** [Django REST Framework](https://www.django-rest-framework.org/)
- **Package Manager:** [uv](https://github.com/astral-sh/uv)
- **Environment Management:** [django-environ](https://github.com/joke2k/django-environ)
- **Profiling:** [django-silk](https://github.com/jazzband/django-silk)
- **Database:** SQLite (Default for development)
- **Linting & Formatting:** [Ruff](https://docs.astral.sh/ruff/)

---

## 📦 Getting Started

### Prerequisites

- [uv](https://github.com/astral-sh/uv) installed
- Python 3.13+

### Setup

1. **Install dependencies:**
   ```bash
   uv sync
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   *(Edit `.env` and add your `SECRET_KEY` and other settings)*

3. **Run migrations:**
   ```bash
   uv run manage.py migrate
   ```

4. **Create admin user:**
   ```bash
   uv run manage.py setup_admin
   ```

5. **Start the development server:**
   ```bash
   uv run manage.py runserver
   ```

The API will be available at: `http://127.0.0.1:8000/`

---

## 🧱 Django Commands

Useful commands for development:

```bash
# Create new migrations after model changes
uv run manage.py makemigrations

# Apply migrations
uv run manage.py migrate

# Check migration status
uv run manage.py showmigrations

# Access Django Shell
uv run manage.py shell
```
## Testing

Run backend tests:
uv run manage.py test

Current API tests:
- apps/authentication/tests.py
- apps/users/tests.py

Each test case includes a concise docstring to describe the expected behavior.

## API Documentation

---

## 🔐 API Documentation & Access

- **Admin Panel:** `http://127.0.0.1:8000/admin/`
- **Profiling (Silk):** `http://127.0.0.1:8000/silk/`
- **Auth Endpoints:**
  - `POST /api/register/` - User registration
  - `POST /api/login/` - User login

---

## 📁 Project Structure

- `config/`: Project settings, root URL routing, and WSGI/ASGI configuration.
- `apps/`: Container for all local Django apps.
  - `authentication/`: Custom authentication logic, including login and registration views.
  - `users/`: User profile management and user-related endpoints.
  - `conversations/`: Conversation and messaging logic.
- `utils/`: Shared utility functions and helpers.
- `manage.py`: Django's command-line utility.

---

## 🛠️ Development

For backend-specific workflows (Ruff, migrations), see the [Backend Development Guide](./development.md).
For global project standards (commit conventions), refer to the root [CONTRIBUTING.md](../CONTRIBUTING.md).

