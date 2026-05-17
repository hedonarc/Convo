# Convo

Convo is a monorepo for a real-time chat platform with frontend, and mobile applications.

## Monorepo Architecture

- `apps/web/`: React frontend using Vite and Tailwind CSS.
- `mobile/`: Mobile app (planned).

## Documentation Map

- Project docs index: [`docs/index.md`](./docs/index.md)
- Backend docs: [`backend`](https://github.com/hedonarc/convo-backend/tree/main/docs)

- Frontend docs:
  - Setup: [`docs/frontend/setup.md`](./docs/frontend/setup.md)
  - Architecture: [`docs/frontend/architecture.md`](./docs/frontend/architecture.md)
  - State management: [`docs/frontend/state-management.md`](./docs/frontend/state-management.md)
  - Testing: [`docs/frontend/testing.md`](./docs/frontend/testing.md)

  ## Release & Versioning

  This project follows [Semantic Versioning](https://semver.org/) and [Conventional Commits](https://www.conventionalcommits.org/).
  - **Versioning Strategy:** Independent (each application maintains its own version).
  - **Automation:**
    - **Frontend/Mobile:** Automated via `changesets` (planned).
  - **Commit Format:** `type(scope): description` (e.g., `feat(frontend): add jwt integration`). Enforcement is handled via `pre-commit`.

  ## Quick Start

  For local setup, you can now use Turborepo to run everything concurrently:

1. Install all dependencies: `pnpm install` and `pnpm run setup`
2. Run development servers: `pnpm run dev`
3. Frontend docs: [`docs/frontend/setup.md`](./docs/frontend/setup.md)

## Development and Contributing
- Global contribution standards: [`CONTRIBUTING.md`](./CONTRIBUTING.md)

## 🤝 Contributors

This project is developed by:

- **Abubakar Khawaja** — Full Stack Developer (React + Django)
- **Muhammad Suleman Butt** — Full Stack Developer (React / React Native + Django)
