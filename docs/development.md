# 🛠️ Backend Development Guide

This guide outlines the backend-specific development standards and tools. For global project standards like commit conventions, see [CONTRIBUTING.md](../CONTRIBUTING.md).

---

## 🧹 Code Quality (Ruff)

We use **Ruff** for linting, formatting, and import sorting the Python codebase.

### Commands

Run these from the `backend/` directory:

```bash
# Lint code
uv run ruff check .

# Check import sorting
uv run ruff check --select I

# Auto-fix issues
uv run ruff check --fix .

# Format code
uv run ruff format .
```

---

## 🚀 Performance & Profiling

### Django Silk
[Django Silk](https://github.com/jazzband/django-silk) is integrated for live profiling of API requests and database queries.

- **Access Dashboard:** `http://127.0.0.1:8000/silk/`
- **Configuration:** Profiling is enabled via `SILKY_PYTHON_PROFILER = True` in `settings.py`.

#### Advanced Profiling

##### Profile Specific Code Blocks

```python
from silk.profiling.profiler import silk_profile

@silk_profile(name="Expensive Calculation")
def my_view(request):
    # ...
```

##### Profile Specific Database Queries

```python
from silk.profiling.profiler import silk_profile

with silk_profile(name="Custom Query Info"):
    result = User.objects.filter(is_active=True)
    # ...
```

---

## 🧱 Django Workflows

### Migrations
Always ensure migrations are created and applied when models change:

```bash
uv run manage.py makemigrations
uv run manage.py migrate
uv run manage.py showmigrations
```
