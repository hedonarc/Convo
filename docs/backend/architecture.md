# Backend Architecture

High-level backend architecture notes.

## Current Modules

- `config/`: Django settings and root routing.
- `apps/`: Local Django apps (`authentication`, `users`, `conversations`).
- `utils/`: Shared helper utilities.

## Planned Additions

- Realtime messaging via Django Channels.
- PostgreSQL for production deployments.
