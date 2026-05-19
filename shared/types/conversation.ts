import type { User } from "./user";

export interface Conversation {
  // Present only on invite create/reminder responses, not on listed conversations.
  action?: "created" | "reminder_sent";
  id: number;
  created_by: number;
  conversation_key: string | null;
  last_message: ConversationLastMessage | null;
  participants?: Participant[];
  created_at: string;
  updated_at: string;
  invitation: Invitation | null;
}

export interface ConversationLastMessage {
  id: number;
  conversation: number;
  sender: number;
  content: string;
  is_deleted: boolean;
  created_at: string;
}

// A participant currently carries the same fields as a User. Reserved for
// future per-membership data (conversation id, joined_at, last_read_message_id).
export interface Participant extends User { }

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
