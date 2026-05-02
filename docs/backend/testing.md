# Backend Testing

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
