# Backend Development

This guide covers backend workflows and quality standards.

## Code Quality (Ruff)

Run from `backend/`:

```bash
uv run ruff check .
uv run ruff check --select I .
uv run ruff check --fix .
uv run ruff format .
```

## Django Migrations

```bash
uv run manage.py makemigrations
uv run manage.py migrate
uv run manage.py showmigrations
```

## Profiling

### Django Silk
[Django Silk](https://github.com/jazzband/django-silk) is integrated for live profiling of API requests and database queries.

- **Access Dashboard:** `http://127.0.0.1:8000/silk/`
- **Configuration:** Profiling is enabled via `SILKY_PYTHON_PROFILER = True` in `settings/local.py`.

## ASGI & WebSockets

During development, `uv run manage.py runserver` will automatically use the ASGI application defined in `config/asgi.py` (powered by Daphne) to handle both HTTP and WebSocket connections.

```base
docker run --rm -p 6379:6379 redis:7
```

Ensure **Redis** is running, as the `CHANNEL_LAYERS` setting expects it for WebSocket group communication.


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
