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
# Check local settings
uv run manage.py check --settings=settings.local

# Run tests
uv run manage.py test --settings=settings.test

# Check production deployment readiness
uv run manage.py check --deploy --settings=settings.production

# Confirm local server starts
uv run manage.py runserver
```

## CI

GitHub Actions workflow: [`.github/workflows/backend-tests.yml`](../../.github/workflows/backend-tests.yml)

Current CI test command:

```bash
uv run python manage.py test --noinput --verbosity=2 --settings=settings.test
```
