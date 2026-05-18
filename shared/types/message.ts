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
