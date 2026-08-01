import {
  type IncomingEvent,
  type OutgoingAction,
  SOCKET_CLOSE_CODES,
  type SocketStatus,
  STABLE_CONNECTION_MS,
} from "./socketEvents";

interface ConversationSocketOptions {
  conversationId: number;
  baseUrl: string;
  onEvent: (event: IncomingEvent) => void;
  onStatusChange: (status: SocketStatus) => void;
  /**
   * Called once per session when the server closes with `INVALID_TOKEN`. If
   * the promise resolves, the socket reconnects with the freshly-set cookie.
   * If it rejects, the close is treated as terminal and `onAuthExpired` fires.
   */
  refreshAuth?: () => Promise<void>;
  /**
   * Called when the connection is closed for an authentication-terminal
   * reason (no token, or refresh failed). Consumer should clear the session
   * state — typically by dispatching the app-wide `auth:expired` event.
   */
  onAuthExpired?: () => void;
  /** Override reconnect tuning if needed; defaults match the Phase-2 plan. */
  maxReconnectAttempts?: number;
  reconnectDelayMs?: number;
}

/**
 * Thin wrapper around a single WebSocket connection to one conversation room.
 *
 * Responsibilities:
 *  - open / send / close
 *  - parse incoming frames into typed `IncomingEvent`s
 *  - bounded auto-reconnect (default: 3 attempts, 2s gap) on abnormal close
 *  - skip reconnect on authentication / authorization close codes
 *
 * Does NOT handle: token refresh, presence, cross-conversation events. Those
 * belong above this layer.
 */
export class ConversationSocket {
  private ws: WebSocket | null = null;
  private intentionalClose = false;
  private reconnectAttempts = 0;
  private authRefreshAttempted = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private openedAt = 0;

  private readonly maxReconnectAttempts: number;
  private readonly reconnectDelayMs: number;

  constructor(private readonly opts: ConversationSocketOptions) {
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
      // URL construction failed (e.g. malformed baseUrl). Treat as terminal.
      this.opts.onStatusChange("closed");
      return;
    }

    this.ws.addEventListener("open", this.handleOpen);
    this.ws.addEventListener("message", this.handleMessage);
    this.ws.addEventListener("close", this.handleClose);
    // `error` events are always followed by `close`; we react there.
  }

  send(action: OutgoingAction["action"], data: OutgoingAction["data"]): void {
    if (this.ws?.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify({ action, data }));
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

  // ── Handlers ────────────────────────────────────────────────────────────

  private handleOpen = (): void => {
    this.openedAt = Date.now();
    this.opts.onStatusChange("open");
  };

  private handleMessage = (event: MessageEvent<string>): void => {
    let parsed: IncomingEvent;
    try {
      parsed = JSON.parse(event.data) as IncomingEvent;
    } catch {
      // Malformed frame — ignore silently rather than crash the consumer.
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

    // Expired access token — the refresh cookie may still be valid. Try once
    // per session: refresh, then reconnect with the freshly-set access cookie.
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

    // Terminal auth failures: no token, refresh already attempted and failed,
    // or no refresh handler injected. Dispatch the session-ended signal so
    // the AuthProvider can clear React state and the route guards redirect.
    if (
      event.code === SOCKET_CLOSE_CODES.NO_TOKEN ||
      event.code === SOCKET_CLOSE_CODES.INVALID_TOKEN
    ) {
      this.opts.onAuthExpired?.();
      this.opts.onStatusChange("closed");
      return;
    }

    // Authorization failure (not a participant) — not an auth-expiry issue.
    // Just close; the user is still logged in.
    if (event.code === SOCKET_CLOSE_CODES.NOT_PARTICIPANT) {
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

  // ── Utilities ───────────────────────────────────────────────────────────

  /** Did this connection outlive an accept-then-reject handshake? */
  private wasStable(): boolean {
    return (
      this.openedAt > 0 && Date.now() - this.openedAt >= STABLE_CONNECTION_MS
    );
  }

  private buildUrl(): string {
    // Translate the HTTP baseUrl into its WS equivalent so cookies and origin
    // align with the REST API.
    const base = new URL(this.opts.baseUrl);
    const protocol = base.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${base.host}/ws/conversations/${this.opts.conversationId}/`;
  }
}
