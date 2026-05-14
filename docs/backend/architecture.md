# Backend Architecture

High-level backend architecture notes.

## Current Modules

- `config/`: Django settings, root WSGI/ASGI routing.
- `apps/`: Local Django apps (`authentication`, `users`, `conversations`).
  - `conversations/`:
    - `consumers.py`: `AsyncWebsocketConsumer` for real-time messaging. Uses action-based routing to handle incoming frames.
- `utils/`: Shared helper utilities.

## Real-time Messaging

Convo uses **Django Channels** to handle WebSocket connections.

- **ASGI Server:** Daphne is used as the ASGI application server.
- **Consumer Logic:** We use asynchronous consumers (`AsyncWebsocketConsumer`) to manage long-lived connections efficiently.
- **Query Decoupling:** To keep consumers clean, all database interactions are abstracted into a `queries.py` module and wrapped in `database_sync_to_async`.
- **Channel Layer:** A Redis-backed channel layer (`channels_redis`) is used for group communication (e.g., broadcasting messages to all participants in a conversation).


## Planned Additions

- PostgreSQL for production deployments.
