import type { Conversation } from "@/shared/types/conversation";
import type { PresenceEntry } from "@/shared/types/presence";
import type { User } from "@/shared/types/user";

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
 * Frames the client can push to the UserConsumer.
 *
 *  - `visibility` — automatic per-tab signal driven by the browser's
 *    `visibilitychange` event. Server treats it as a tab-level hint and
 *    will NOT override an explicit user intent.
 *  - `set_status` — explicit user choice from the account menu. Records
 *    (or clears) a user-level manual override on the server that
 *    survives tab focus events and WS reconnects.
 */
export type UserSocketOutgoing =
  | { action: "visibility"; data: { visible: boolean } }
  | { action: "set_status"; data: { status: "online" | "away" } };
