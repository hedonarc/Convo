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

1.  **Backend Setup**: Follow the instructions in [backend/README.md](./backend/README.md).
2.  **Frontend Setup**: *(Coming Soon)*

### Global Prerequisites

- **Git**: For version control.
- **uv**: For Python dependency management. [Install uv](https://github.com/astral-sh/uv).

---

## 🛠️ Development & Contributing

We maintain high standards for code quality and consistency.

- **Global Standards**: Please review [CONTRIBUTING.md](./CONTRIBUTING.md) for commit conventions and pre-commit hook setup.
- **Backend Development**: See [backend/DEVELOPMENT.md](./backend/DEVELOPMENT.md) for Python/Django specific workflows and tools (Ruff).
- **Frontend Development**: *(Coming Soon)*
---

### 3. Create Admin User

```bash
uv run manage.py setup_admin
```

---

### 4. Run Server

```bash
uv run manage.py runserver
```

Application will be available at:

```
http://127.0.0.1:8000/
```

---

## 🧱 Django Commands

```bash
# Create & apply migrations
uv run manage.py makemigrations && uv run manage.py migrate

# Check migration status
uv run manage.py showmigrations
```

---

## 🧹 Code Quality (Ruff)

```bash
# Lint code
uv run ruff check .

# Auto-fix issues
uv run ruff check . --fix

# Format code
uv run ruff format .
```

---

## ✅ Testing

```bash
# Run backend test suite
cd backend
uv run python manage.py test
```

Current API tests live in:
- `backend/apps/authentication/tests.py`
- `backend/apps/users/tests.py`

Each test case includes a short docstring describing the behavior it validates.

---

## 🤖 GitHub CI

Backend unit tests run automatically on GitHub Actions.

- **Workflow file**: [`.github/workflows/backend-tests.yml`](./.github/workflows/backend-tests.yml)
- **Triggers**:
  - Pull requests targeting `main` that touch `backend/**` or the workflow file.
  - Pushes to `main` that touch `backend/**` or the workflow file.
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

## 🧾 Commit Message Convention

We follow **Conventional Commits** to keep git history clean, readable, and automation-friendly.

---

### 📌 Format

```txt
type: short description
```

---

### 📏 Rules & Limitations

* ✔ Use lowercase only
* ✔ Maximum 72 characters total
* ✔ Keep description short and meaningful (recommended ≤ 50 chars)
* ✔ No full sentences (avoid "I fixed...", "I added...")
* ✔ No vague messages like "update", "fix bug", "final changes"

---

### 🧩 Allowed Types

* `feat` → new feature
* `fix` → bug fix
* `chore` → maintenance tasks (deps, config, etc.)
* `refactor` → code changes without behavior change
* `docs` → documentation changes
* `test` → adding or updating tests

---

### 💡 Examples

```bash
feat: add real-time messaging API
fix: resolve authentication token issue
chore: update ruff configuration
refactor: simplify chat serializer logic
```

---

### 🚫 Invalid Examples

```bash
updated code
Fix Bug in API
final changes for production ready version of chat system
```

---

### ⚙️ Enforcement

This rule is automatically enforced by **pre-commit hooks**, so invalid commit messages will be rejected before committing.

To install pre-commit hooks:
```bash
uv run pre-commit install --hook-type pre-commit
uv run pre-commit install --hook-type commit-msg
```

---

## 🔐 Admin Panel

```
http://127.0.0.1:8000/admin/
```

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
