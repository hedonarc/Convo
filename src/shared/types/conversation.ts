import type { Message } from "./message";
import type { User } from "./user";

export interface Conversation {
  // Present only on invite create/reminder responses, not on listed conversations.
  action?: "created" | "reminder_sent";
  id: number;
  created_by: number;
  conversation_key: string | null;
  last_message: Message | null;
  participants?: Participant[];
  created_at: string;
  updated_at: string;
  invitation: Invitation | null;
  /**
   * Per-participant read pointer keyed by user id (as string, because JSON).
   * `null` means the participant hasn't read anything yet. Used for the
   * sidebar's unread dot and the "Seen" double-tick on own messages.
   */
  read_receipts?: Record<string, number | null>;
  /**
   * Per-participant delivery pointer keyed by user id. Always ≤ that user's
   * `read_receipts` entry once they've read. Drives the gray double-tick on
   * own messages (sent → delivered → seen progression).
   */
  delivery_receipts?: Record<string, number | null>;
}

// A participant currently carries the same fields as a User. Reserved for
// future per-membership data (conversation id, joined_at, last_read_message_id).
// Aliased rather than `interface Participant extends User {}` so the
// no-empty-object-type rule doesn't fire — semantics identical.
export type Participant = User;

export interface PaginatedResponse<T> {
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface StartConversationResponse {
  conversation: Conversation;
  is_created: boolean;
}

export interface Invitation {
  email: string;
  is_accepted: boolean;
  updated_at: string;
}
