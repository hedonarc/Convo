import type { Conversation } from "@shared/types/conversation";
import type { User } from "@shared/types/user";

/**
 * Frames the backend's UserConsumer pushes to the connected client. The
 * channel is read-only — no outgoing actions today.
 */
export type UserSocketEvent =
  | { type: "conversation_updated"; data: Conversation }
  | {
      type: "invite_accepted";
      data: { acceptor: User; conversation_id: number };
    }
  | { type: "error"; message: string };
