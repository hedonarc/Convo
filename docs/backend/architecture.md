# Backend Architecture

High-level backend architecture notes.

## Current Modules

- `config/`: Django settings, root WSGI/ASGI routing.
- `apps/`: Local Django apps (`authentication`, `users`, `conversations`).
  - `conversations/consumers.py`: WebSocket consumers for real-time messaging.
- `utils/`: Shared helper utilities.

## Real-time Messaging

Convo uses **Django Channels** to handle WebSocket connections. 

- **ASGI Server:** Daphne is used as the ASGI application server.
- **Channel Layer:** A Redis-backed channel layer (`channels_redis`) is used for group communication (e.g., broadcasting messages to all participants in a conversation).

## Planned Additions

- PostgreSQL for production deployments.
