# Convo

Convo is a repository for a real-time chat platform frontend.

## Architecture

- `src/`: React frontend using Vite and Tailwind CSS.

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
  - **Automation:**
    - **Frontend:** Automated via `semantic-release`.
  - **Commit Format:** `type(scope): description` (e.g., `feat(ui): add jwt integration`). Enforcement is handled via `pre-commit`.

  ## Quick Start

  For local setup, you can now use Turborepo to run everything concurrently:

1. Install all dependencies: `pnpm install`
2. Run development servers: `pnpm run dev`
3. Frontend docs: [`docs/frontend/setup.md`](./docs/frontend/setup.md)

## Development and Contributing

- Global contribution standards: [`CONTRIBUTING.md`](./CONTRIBUTING.md)

## 🤝 Contributors

This project is developed by:

- **Abubakar Khawaja** — Full Stack Developer (React + Django)
- **Muhammad Suleman Butt** — Full Stack Developer (React / React Native + Django)
