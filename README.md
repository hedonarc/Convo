# 💬 Convo

Convo is a modern, real-time chat application designed for scalability and performance. It features a robust Django-based API and is built with modern development tooling.

---

## 🏗️ Architecture

The project is structured as a monorepo:

- **`/backend`**: Django REST Framework API, handling authentication, messaging logic, and user management.
- **`/frontend`**: *(Coming Soon)* Modern web interface built with React/Next.js.

---

## 🚀 Quick Start

To get the project running locally, follow the setup guides for each component:

1.  **Backend Setup**: Follow the instructions in [docs/backend.md](./docs/backend.md).
2.  **Frontend Setup**: *(Coming Soon)*

### Global Prerequisites

- **Git**: For version control.
- **uv**: For Python dependency management. [Install uv](https://github.com/astral-sh/uv).

---

## 🛠️ Development & Contributing

We maintain high standards for code quality and consistency.

- **Backend Development**: See [docs/backend.md](./docs/backend.md) for Python/Django specific workflows and tools (Ruff).
- **Frontend Development**: *(Coming Soon)*
- **Global Standards**: Please review [CONTRIBUTING.md](./CONTRIBUTING.md) for commit conventions and pre-commit hook setup.
---

## 🤖 GitHub CI

Backend unit tests run automatically on GitHub Actions.

### Backend CI
- **Workflow file**: [`.github/workflows/backend-tests.yml`](./.github/workflows/backend-tests.yml)
- **Triggers**:
  - Pull requests targeting `main` and `dev` branches.
  - Pushes to `main` and `dev` branches.
- **Runtime**: `ubuntu-latest` with Python 3.13 installed via [`astral-sh/setup-uv`](https://github.com/astral-sh/setup-uv).
- **Commands CI runs** (from the `backend/` directory):

```bash
uv sync --frozen
uv run python manage.py test --noinput --verbosity=2
```

### Required Secret

The Django settings require `SECRET_KEY`. The workflow uses the `SECRET_KEY` repository secret if present, otherwise it falls back to a CI-only placeholder so the workflow is green out-of-the-box.

To configure the secret (recommended):

1. Open the repository on GitHub.
2. Go to **Settings → Secrets and variables → Actions → New repository secret**.
3. Name it `SECRET_KEY` and paste any non-empty value (CI does not need your production key).

### Why `--parallel` and `--keepdb` are not used

- `--keepdb`: CI runners are ephemeral, so there is no test DB to keep between runs. Caching the SQLite file would risk stale schemas and false-green tests.
- `--parallel`: the suite is small today and uses file-based SQLite, which has parallel limitations. We will revisit once the suite grows or when CI moves to PostgreSQL.

---

## 🤝 Contributors

This project is developed by:

* **Abubakar Khawaja** — Full Stack Developer (React + Django)
* **Muhammad Suleman Butt** — Full Stack Developer (React / React Native + Django)

---

## 🧠 Project Notes & Roadmap

- **Database**: SQLite is used for development; easily extendable to PostgreSQL.
- **Real-time**: Integration with WebSockets (Django Channels) is planned.
- **Auth**: Fully integrated with JWT (JSON Web Tokens) using `djangorestframework-simplejwt`.
- **Frontend**: *(Coming Soon)*
- **Mobile Apps**: *(Coming Soon)*