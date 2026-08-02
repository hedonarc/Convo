import {
  REJECTION_CODES,
  SOCKET_CLOSE_CODES,
  type SocketStatus,
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
  /** Set by the server's `connected` frame — the only proof a socket is real. */
  private confirmed = false;
  /** A rejection code seen as data, in case the close frame never arrives. */
  private rejectedWith: number | null = null;

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
    this.confirmed = false;
    this.rejectedWith = null;
    this.opts.onStatusChange("closed");
  }

  private handleOpen = (): void => {
    // Deliberately not a stability signal: the server also accepts sockets it
    // is about to reject, because a close code cannot reach a browser that
    // never completed the upgrade.
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

    const frame = parsed as { type?: string; code?: number };
    if (frame.type === "connected") {
      this.confirmed = true;
      return;
    }
    if (frame.type === "error" && REJECTION_CODES.includes(frame.code ?? -1)) {
      // The close carrying this code may never arrive; remember it.
      this.rejectedWith = frame.code ?? null;
    }

    this.opts.onEvent(parsed);
  };

  private handleClose = (event: CloseEvent): void => {
    this.ws = null;
    if (this.confirmed) {
      this.reconnectAttempts = 0;
      this.authRefreshAttempted = false;
    }
    this.confirmed = false;

    // Proxies in front of the server drop a close frame sent immediately
    // after the handshake, leaving a bare 1006 behind. Fall back to the code
    // the server sent as data.
    const code = REJECTION_CODES.includes(event.code)
      ? event.code
      : (this.rejectedWith ?? event.code);
    this.rejectedWith = null;

    if (this.intentionalClose) return;

    // Expired access token, but the refresh cookie may still be good. Try
    // once, then reconnect with the newly-set access cookie.
    if (
      code === SOCKET_CLOSE_CODES.INVALID_TOKEN &&
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
      code === SOCKET_CLOSE_CODES.NO_TOKEN ||
      code === SOCKET_CLOSE_CODES.INVALID_TOKEN
    ) {
      this.opts.onAuthExpired?.();
      this.opts.onStatusChange("closed");
      return;
    }

    // Not a participant. Still logged in, so nothing to refresh.
    if (code === SOCKET_CLOSE_CODES.NOT_PARTICIPANT) {
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

  private buildUrl(): string {
    // Same host as the REST API, so the auth cookie and origin line up.
    const base = new URL(this.opts.baseUrl);
    const protocol = base.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${base.host}${this.opts.path}`;
  }
}
