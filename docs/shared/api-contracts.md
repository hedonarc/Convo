# Shared API Contracts

This page should define client-backend contract expectations shared by frontend and mobile.

Include:

- Endpoint versioning policy
- Response envelope conventions
- Error format conventions

## WebSocket Message Format
<!-- Will update in future -->
Messages sent and received over WebSockets use a standard JSON structure.

### Sending a message
```json
{
  "message": "Hello world!"
}
```

### Receiving a message
```json
{
  "message": "Hello world!"
}
```
