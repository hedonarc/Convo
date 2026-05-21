import {
  type IncomingEvent,
  type OutgoingAction,
  SOCKET_CLOSE_CODES,
  type SocketStatus,
} from "./socketEvents";

interface ConversationSocketOptions {
  conversationId: number;
  baseUrl: string;
  onEvent: (event: IncomingEvent) => void;
  onStatusChange: (status: SocketStatus) => void;
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
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

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
    this.opts.onStatusChange("closed");
  }

  // ── Handlers ────────────────────────────────────────────────────────────

  private handleOpen = (): void => {
    this.reconnectAttempts = 0;
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
    if (this.intentionalClose) return;

    // Auth / authorization failures are terminal — don't retry.
    if (
      event.code === SOCKET_CLOSE_CODES.NO_TOKEN ||
      event.code === SOCKET_CLOSE_CODES.INVALID_TOKEN ||
      event.code === SOCKET_CLOSE_CODES.NOT_PARTICIPANT
    ) {
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

  private buildUrl(): string {
    // Translate the HTTP baseUrl into its WS equivalent so cookies and origin
    // align with the REST API.
    const base = new URL(this.opts.baseUrl);
    const protocol = base.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${base.host}/ws/conversations/${this.opts.conversationId}/`;
  }
}
