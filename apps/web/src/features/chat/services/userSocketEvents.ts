import type { Conversation } from "@shared/types/conversation";
import type { PresenceEntry } from "@shared/types/presence";
import type { User } from "@shared/types/user";

/**
 * Frames the backend's UserConsumer pushes to the connected client.
 */
export type UserSocketEvent =
  | { type: "conversation_updated"; data: Conversation }
  | {
      type: "invite_accepted";
      data: { acceptor: User; conversation_id: number };
    }
  | { type: "presence_changed"; data: PresenceEntry }
  | { type: "error"; message: string };

/**
 * Frames the client can push to the UserConsumer. Today: a visibility ping
 * so the server can mark this tab as away (hidden) or online (visible).
 */
export type UserSocketOutgoing = {
  action: "visibility";
  data: { visible: boolean };
};
