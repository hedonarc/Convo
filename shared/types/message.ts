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
