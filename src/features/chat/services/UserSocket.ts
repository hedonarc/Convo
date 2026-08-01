import {
  SOCKET_CLOSE_CODES,
  type SocketStatus,
  STABLE_CONNECTION_MS,
} from "./socketEvents";
import type { UserSocketEvent, UserSocketOutgoing } from "./userSocketEvents";

interface UserSocketOptions {
  baseUrl: string;
  onEvent: (event: UserSocketEvent) => void;
  onStatusChange: (status: SocketStatus) => void;
  /** Same shape as ConversationSocket — see its docstring. */
  refreshAuth?: () => Promise<void>;
  onAuthExpired?: () => void;
  maxReconnectAttempts?: number;
  reconnectDelayMs?: number;
}

/**
 * One per-user WebSocket connection. Read-only — receives cross-conversation
 * fanout events (today: `conversation_updated`) so the sidebar can update
 * without one socket per conversation.
 *
 * Mirrors `ConversationSocket`'s connection-management semantics: bounded
 * reconnect, refresh-then-reconnect on `INVALID_TOKEN`, terminal-auth routes
 * to `onAuthExpired`. Kept as a sibling class rather than a generic socket
 * primitive — the two have different event shapes and no `send()` here, and
 * separate classes stay self-documenting.
 */
export class UserSocket {
  private ws: WebSocket | null = null;
  private intentionalClose = false;
  private reconnectAttempts = 0;
  private authRefreshAttempted = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private openedAt = 0;

  private readonly maxReconnectAttempts: number;
  private readonly reconnectDelayMs: number;

  constructor(private readonly opts: UserSocketOptions) {
    this.maxReconnectAttempts = opts.maxReconnectAttempts ?? 3;
    this.reconnectDelayMs = opts.reconnectDelayMs ?? 2000;
  }

  connect(): void {
    this.intentionalClose = false;
    this.opts.onStatusChange(
      this.reconnectAttempts === 0 ? "connecting" : "reconnecting",
    );

    try {
      this.ws = new WebSocket(this.buildUrl());
    } catch {
      this.opts.onStatusChange("closed");
      return;
    }

    this.ws.addEventListener("open", this.handleOpen);
    this.ws.addEventListener("message", this.handleMessage);
    this.ws.addEventListener("close", this.handleClose);
  }

  close(): void {
    this.intentionalClose = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws && this.ws.readyState !== WebSocket.CLOSED) {
      this.ws.close(SOCKET_CLOSE_CODES.NORMAL);
    }
    this.ws = null;
    this.openedAt = 0;
    this.opts.onStatusChange("closed");
  }

  /**
   * Push an outgoing frame to the server. No-ops silently if the socket
   * isn't open yet — caller is expected to be fire-and-forget (e.g. the
   * visibility ping).
   */
  send(frame: UserSocketOutgoing): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify(frame));
  }

  // ── Handlers ────────────────────────────────────────────────────────────

  private handleOpen = (): void => {
    this.openedAt = Date.now();
    this.opts.onStatusChange("open");
  };

  private handleMessage = (event: MessageEvent<string>): void => {
    let parsed: UserSocketEvent;
    try {
      parsed = JSON.parse(event.data) as UserSocketEvent;
    } catch {
      return;
    }
    this.opts.onEvent(parsed);
  };

  private handleClose = (event: CloseEvent): void => {
    this.ws = null;
    if (this.wasStable()) {
      this.reconnectAttempts = 0;
      this.authRefreshAttempted = false;
    }
    this.openedAt = 0;
    if (this.intentionalClose) return;

    if (
      event.code === SOCKET_CLOSE_CODES.INVALID_TOKEN &&
      this.opts.refreshAuth &&
      !this.authRefreshAttempted
    ) {
      this.authRefreshAttempted = true;
      this.opts.onStatusChange("reconnecting");
      this.opts
        .refreshAuth()
        .then(() => this.connect())
        .catch(() => {
          this.opts.onAuthExpired?.();
          this.opts.onStatusChange("closed");
        });
      return;
    }

    if (
      event.code === SOCKET_CLOSE_CODES.NO_TOKEN ||
      event.code === SOCKET_CLOSE_CODES.INVALID_TOKEN
    ) {
      this.opts.onAuthExpired?.();
      this.opts.onStatusChange("closed");
      return;
    }

    if (event.code === SOCKET_CLOSE_CODES.NOT_PARTICIPANT) {
      // Doesn't apply on the user channel, but keep the route for parity.
      this.opts.onStatusChange("closed");
      return;
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.opts.onStatusChange("closed");
      return;
    }

    this.reconnectAttempts++;
    this.opts.onStatusChange("reconnecting");
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, this.reconnectDelayMs);
  };

  /** Did this connection outlive an accept-then-reject handshake? */
  private wasStable(): boolean {
    return (
      this.openedAt > 0 && Date.now() - this.openedAt >= STABLE_CONNECTION_MS
    );
  }

  private buildUrl(): string {
    const base = new URL(this.opts.baseUrl);
    const protocol = base.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${base.host}/ws/user/`;
  }
}
