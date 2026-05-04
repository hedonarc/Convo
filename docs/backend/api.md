# Backend API

API usage and endpoint references for backend services.

## Access

- Admin: `http://127.0.0.1:8000/admin/`
- Profiling: `http://127.0.0.1:8000/silk/`

## Auth Endpoints

- `POST /api/register/`
- `POST /api/login/`

## WebSocket Endpoints

Real-time messaging is handled via WebSockets.

### Conversations
- **URL:** `ws://127.0.0.1:8000/ws/conversations/<conversation_id>/`
- **Description:** Connect to this endpoint to receive and send messages in real-time for a specific conversation.
- **Authentication:** (Planned) JWT authentication via WebSocket headers/query params.

Add endpoint groups here as the API grows (users, conversations, messages).
