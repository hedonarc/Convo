export interface Conversation {
  id: number;
  created_by: number;
  conversation_key: string | null;
  last_message: ConversationLastMessage | null;
  created_at: string;
  updated_at: string;
  participants?: any
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
  user: number;
  conversation: number;
  joined_at: string;
  last_read_message_id: number | null;
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
