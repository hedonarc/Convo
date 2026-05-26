/**
 * Mirrors the backend's MessageSerializer
 * (apps/conversations/api/serializers/message.py).
 *
 * `sender` is a user id only — resolve names/avatars via the conversation's
 * `participants` array.
 */
export interface Message {
  id: number;
  conversation: number;
  sender: number;
  content: string;
  prev_content: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  edited_at: string | null;
  deleted_at: string | null;
}

/** Client-side status for optimistic / pending sends. */
export type MessageStatus = "sending" | "sent" | "failed";

/**
 * An outgoing message that hasn't yet been acknowledged by the server.
 * Held client-side and rendered alongside committed messages with a dimmed
 * bubble + status icon. Reconciled out of state once the WebSocket echo of
 * the persisted message arrives.
 */
export interface PendingMessage {
  clientId: string;
  content: string;
  status: MessageStatus;
  createdAt: string;
}
