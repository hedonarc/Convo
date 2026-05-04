# Convo

Convo is a monorepo for a real-time chat platform with backend, frontend, and mobile applications.

## Monorepo Architecture

- `backend/`: Django REST Framework API for authentication, messaging, and user management. Includes real-time support via Django Channels and Redis.
- `frontend/`: Web app (planned).
- `mobile/`: Mobile app (planned).

## Documentation Map

- Project docs index: [`docs/index.md`](./docs/index.md)
- Backend docs:
  - Setup: [`docs/backend/setup.md`](./docs/backend/setup.md)
  - Development: [`docs/backend/development.md`](./docs/backend/development.md)
  - Architecture: [`docs/backend/architecture.md`](./docs/backend/architecture.md)
  - API: [`docs/backend/api.md`](./docs/backend/api.md)
  - Testing: [`docs/backend/testing.md`](./docs/backend/testing.md)
  - Translations: [`docs/backend/translations.md`](./docs/backend/translations.md)

- Frontend docs:
  - Setup: [`docs/frontend/setup.md`](./docs/frontend/setup.md)
  - Architecture: [`docs/frontend/architecture.md`](./docs/frontend/architecture.md)
  - State management: [`docs/frontend/state-management.md`](./docs/frontend/state-management.md)
  - Testing: [`docs/frontend/testing.md`](./docs/frontend/testing.md)

- Mobile docs:
  - Setup: [`docs/mobile/setup.md`](./docs/mobile/setup.md)
  - Architecture: [`docs/mobile/architecture.md`](./docs/mobile/architecture.md)
  - Navigation: [`docs/mobile/navigation.md`](./docs/mobile/navigation.md)
  - Testing: [`docs/mobile/testing.md`](./docs/mobile/testing.md)

- Shared docs:
  - Auth flow: [`docs/shared/auth-flow.md`](./docs/shared/auth-flow.md)
  - API contracts: [`docs/shared/api-contracts.md`](./docs/shared/api-contracts.md)
  - Environments: [`docs/shared/environments.md`](./docs/shared/environments.md)
  - Release process: [`docs/shared/release-process.md`](./docs/shared/release-process.md)

  ## Release & Versioning

  This project follows [Semantic Versioning](https://semver.org/) and [Conventional Commits](https://www.conventionalcommits.org/).

  - **Versioning Strategy:** Independent (each application maintains its own version).
  - **Automation:** 
    - **Backend:** Automated via `python-semantic-release`.
    - **Frontend/Mobile:** Automated via `changesets` (planned).
  - **Commit Format:** `type(scope): description` (e.g., `feat(backend): add jwt auth`). Enforcement is handled via `pre-commit`.

  ## Quick Start
For local setup:

1. Backend: follow [`docs/backend/setup.md`](./docs/backend/setup.md).
2. Frontend: follow [`docs/frontend/setup.md`](./docs/frontend/setup.md) once the app is added.
3. Mobile: follow [`docs/mobile/setup.md`](./docs/mobile/setup.md) once the app is added.

## Development and Contributing

- Backend workflows (Ruff, migrations, profiling): [`docs/backend/development.md`](./docs/backend/development.md)
- Global contribution standards: [`CONTRIBUTING.md`](./CONTRIBUTING.md)

## 🤝 Contributors

This project is developed by:

* **Abubakar Khawaja** — Full Stack Developer (React + Django)
* **Muhammad Suleman Butt** — Full Stack Developer (React / React Native + Django)