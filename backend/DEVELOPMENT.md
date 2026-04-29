# 🛠️ Backend Development Guide

This guide outlines the backend-specific development standards and tools. For global project standards like commit conventions, see [CONTRIBUTING.md](../CONTRIBUTING.md).

---

## 🧹 Code Quality (Ruff)

We use **Ruff** for linting and formatting the Python codebase.

### Commands

Run these from the `backend/` directory:

```bash
# Lint code
uv run ruff check .

# Auto-fix issues
uv run ruff check . --fix

# Format code
uv run ruff format .
```

---

## 🧱 Django Workflows

### Migrations
Always ensure migrations are created and applied when models change:

```bash
uv run manage.py makemigrations
uv run manage.py migrate
```

### Testing
*(Add testing instructions here once implemented)*
