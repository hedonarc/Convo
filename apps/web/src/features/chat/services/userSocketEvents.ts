import type { Conversation } from "@shared/types/conversation";

/**
 * Frames the backend's UserConsumer pushes to the connected client. The
 * channel is read-only — no outgoing actions today.
 */
export type UserSocketEvent =
  | { type: "conversation_updated"; data: Conversation }
  | { type: "error"; message: string };
