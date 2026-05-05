# Backend Testing

## Structure

We follow a modular test structure for each app. For example, in the `conversations` app:

```text
backend/apps/conversations/
├── tests/
│   ├── __init__.py
│   ├── test_models.py
│   ├── test_api.py
│   ├── test_permissions.py
│   ├── test_services.py
│   ├── test_websockets.py
│   └── factories.py   # optional (very useful)
```

## Run Tests

From `backend/`:

```bash
uv run manage.py test
```

## CI

GitHub Actions workflow: [`.github/workflows/backend-tests.yml`](../../.github/workflows/backend-tests.yml)

Current CI test command:

```bash
uv run python manage.py test --noinput --verbosity=2
```
