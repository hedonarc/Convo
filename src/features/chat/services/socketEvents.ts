import type { Message } from "@/shared/types/message";

/**
 * Discriminated unions matching the backend's WebSocket frame schema
 * (apps/conversations/consumers.py).
 */

// ── Client → Server ────────────────────────────────────────────────────────
export type OutgoingAction =
  | { action: "send_message"; data: { content: string } }
  | { action: "typing"; data: { is_typing: boolean } }
  | { action: "read"; data: { message_id: number } };

// ── Server → Client ────────────────────────────────────────────────────────
export type IncomingEvent =
  | { type: "new_message"; data: Message }
  | { type: "message_edited"; data: Message }
  | { type: "message_deleted"; data: Message }
  | { type: "typing"; data: { user_id: number; is_typing: boolean } }
  | { type: "read_receipt"; data: { user_id: number; message_id: number } }
  | {
      type: "delivered_receipt";
      data: { user_id: number; message_id: number };
    }
  // Sent the moment the server accepts. Proof the connection is real, as
  // opposed to one accepted only to deliver a rejection.
  | { type: "connected"; data: Record<string, never> }
  // Backend's error frame is asymmetric — message lives at the top level.
  // `code` is present on rejections; see utils/ws.py.
  | { type: "error"; message: string; code?: number };

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

/** Rejection codes, which arrive as data as well as in the close frame. */
export const REJECTION_CODES: readonly number[] = [
  SOCKET_CLOSE_CODES.NO_TOKEN,
  SOCKET_CLOSE_CODES.INVALID_TOKEN,
  SOCKET_CLOSE_CODES.NOT_PARTICIPANT,
];
