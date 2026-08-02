import {
  SOCKET_CLOSE_CODES,
  type SocketStatus,
  STABLE_CONNECTION_MS,
} from "./socketEvents";

export interface RealtimeSocketOptions<TIncoming> {
  /** Absolute path on the API host, e.g. `/ws/user/`. */
  path: string;
  /** HTTP base URL; the scheme is translated to ws/wss. */
  baseUrl: string;
  onEvent: (event: TIncoming) => void;
  onStatusChange: (status: SocketStatus) => void;
  /**
   * Called once per connection attempt when the server closes with
   * `INVALID_TOKEN`. Resolving reconnects with the freshly-set cookie;
   * rejecting is terminal and fires `onAuthExpired`.
   */
  refreshAuth?: () => Promise<void>;
  /**
   * Called when the connection ends for an authentication-terminal reason.
   * Consumers typically dispatch the app-wide `auth:expired` event.
   */
  onAuthExpired?: () => void;
  maxReconnectAttempts?: number;
  reconnectDelayMs?: number;
}

/**
 * One WebSocket connection, with the reconnect and auth-refresh policy the
 * app expects.
 *
 * `TIncoming` and `TOutgoing` are the only things that differ between the
 * conversation socket and the per-user socket, so they are type parameters
 * rather than separate classes.
 */
export class RealtimeSocket<TIncoming, TOutgoing> {
  private ws: WebSocket | null = null;
  private intentionalClose = false;
  private reconnectAttempts = 0;
  private authRefreshAttempted = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private openedAt = 0;

  private readonly maxReconnectAttempts: number;
  private readonly reconnectDelayMs: number;

  constructor(private readonly opts: RealtimeSocketOptions<TIncoming>) {
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
      // A malformed baseUrl will not fix itself on a retry.
      this.opts.onStatusChange("closed");
      return;
    }

    this.ws.addEventListener("open", this.handleOpen);
    this.ws.addEventListener("message", this.handleMessage);
    this.ws.addEventListener("close", this.handleClose);
    // `error` is always followed by `close`; we react there.
  }

  /** Fire-and-forget: silently dropped if the socket is not open. */
  send(frame: TOutgoing): void {
    if (this.ws?.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify(frame));
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

  private handleOpen = (): void => {
    this.openedAt = Date.now();
    this.opts.onStatusChange("open");
  };

  private handleMessage = (event: MessageEvent<string>): void => {
    let parsed: TIncoming;
    try {
      parsed = JSON.parse(event.data) as TIncoming;
    } catch {
      // A malformed frame should not take the consumer down with it.
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

    // Expired access token, but the refresh cookie may still be good. Try
    // once, then reconnect with the newly-set access cookie.
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

    // No token, or the refresh above already failed. The session is over.
    if (
      event.code === SOCKET_CLOSE_CODES.NO_TOKEN ||
      event.code === SOCKET_CLOSE_CODES.INVALID_TOKEN
    ) {
      this.opts.onAuthExpired?.();
      this.opts.onStatusChange("closed");
      return;
    }

    // Not a participant. Still logged in, so nothing to refresh.
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

  /** Did this connection outlive an accept-then-reject handshake? */
  private wasStable(): boolean {
    return (
      this.openedAt > 0 && Date.now() - this.openedAt >= STABLE_CONNECTION_MS
    );
  }

  private buildUrl(): string {
    // Same host as the REST API, so the auth cookie and origin line up.
    const base = new URL(this.opts.baseUrl);
    const protocol = base.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${base.host}${this.opts.path}`;
  }
}
