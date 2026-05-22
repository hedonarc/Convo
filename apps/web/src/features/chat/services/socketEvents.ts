import type { Message } from "@shared/types/message";

/**
 * Discriminated unions matching the backend's WebSocket frame schema
 * (apps/conversations/consumers.py).
 */

// ── Client → Server ────────────────────────────────────────────────────────
export type OutgoingAction =
  | { action: "send_message"; data: { content: string } };

// ── Server → Client ────────────────────────────────────────────────────────
export type IncomingEvent =
  | { type: "new_message"; data: Message }
  // Backend's error frame is asymmetric — message lives at the top level.
  | { type: "error"; message: string };

// ── Connection state ───────────────────────────────────────────────────────
export type SocketStatus =
  | "idle"
  | "connecting"
  | "open"
  | "reconnecting"
  | "closed";

// ── Backend close codes (apps/conversations/consumers.py) ──────────────────
export const SOCKET_CLOSE_CODES = {
  NORMAL: 1000,
  NO_TOKEN: 4001,
  INVALID_TOKEN: 4002,
  NOT_PARTICIPANT: 4003,
} as const;
