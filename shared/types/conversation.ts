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

export interface Participant {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  // Will add this in future:
  //   conversation: number;
  //   joined_at: string;
  //   last_read_message_id: number | null;
}

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
