# Shared API Contracts

This page should define client-backend contract expectations shared by frontend and mobile.

Include:

- Endpoint versioning policy
- Response envelope conventions
- Error format conventions

## WebSocket Message Format

Messages sent and received over WebSockets use a structured JSON format.

### Client-to-Server Actions

The client sends messages using an `action` and `data` envelope.

#### 1. Send Message

```json
{
  "action": "send_message",
  "data": {
    "content": "Hello world!"
  }
}
```

#### 2. Typing Indicator

```json
{
  "action": "typing",
  "data": {
    "is_typing": true
  }
}
```

#### 3. Read Receipt

```json
{
  "action": "read",
  "data": {
    "message_id": 123
  }
}
```

### Server-to-Client Events

The server broadcasts events using a `type` and `data` envelope.

#### 1. New Message (`new_message`)

Sent to all participants when a new message is created.

```json
{
  "type": "new_message",
  "data": {
    "id": 123,
    "content": "Hello world!",
    "sender": { "id": 1, "username": "alice" },
    "created_at": "2026-05-13T14:00:00Z"
  }
}
```

#### 2. Typing Indicator (`typing`)

Broadcast to other participants when a user starts/stops typing.

```json
{
  "type": "typing",
  "data": {
    "user_id": 1,
    "is_typing": true
  }
}
```

#### 3. Read Receipt (`read_receipt`)

Broadcast when a participant marks a message as read.

```json
{
  "type": "read_receipt",
  "data": {
    "user_id": 1,
    "message_id": 123
  }
}
```

#### 4. Error (`error`)

Sent directly to the client when an action fails.

```json
{
  "type": "error",
  "message": "Invalid JSON format"
}
```
