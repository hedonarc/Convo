# 💬 Chat Backend API

A scalable backend for a real-time Chat Application built with **Django**, **Django REST Framework**, and modern tooling like **uv** and **Ruff**.

---

## 🚀 Tech Stack

- Django 6.0+
- Django REST Framework
- uv (package manager)
- Ruff (linting + formatting)
- SQLite (default DB)

---

## 📦 Setup

### 1. Clone & Install

```bash
git clone https://github.com/hedonarc/Convo
cd backend
uv sync
````

---

### 2. Database Setup

```bash
uv run manage.py makemigrations && uv run manage.py migrate
```

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
- `backend/auth/tests.py`
- `backend/users/tests.py`

Each test case includes a short docstring describing the behavior it validates.

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

This project is developed by a full-stack team:

* Abubakar Khawaja — Full Stack Developer (React + Django)
* Muhammad Suleman Butt — Full Stack Developer (React / React Native + Django)

---

## 🧠 Notes

* SQLite is used for development only
* uv ensures fast and reproducible dependency management
* Ruff replaces flake8, black, and isort
* Easily extendable to PostgreSQL for production

---

## 📌 Future Improvements

* WebSockets (real-time chat)
* JWT authentication
* PostgreSQL support
* Docker setup
* Chat architecture (rooms, groups, DMs)
