import { AUTH_EXPIRED_EVENT, authApi } from "@shared/api";
import { useEffect, useRef, useState } from "react";

import type { SocketStatus } from "../services/socketEvents";
import { UserSocket } from "../services/UserSocket";
import type { UserSocketEvent } from "../services/userSocketEvents";

interface UseUserSocketResult {
  status: SocketStatus;
}

/**
 * One per-user WebSocket while a user is logged in. Surfaces cross-
 * conversation server pushes (today: `conversation_updated`) via the
 * `onEvent` callback — read via a ref so consumers can pass inline arrows
 * without re-running the connect effect.
 */
export function useUserSocket(
  onEvent: (event: UserSocketEvent) => void,
): UseUserSocketResult {
  const [status, setStatus] = useState<SocketStatus>("idle");
  const socketRef = useRef<UserSocket | null>(null);
  const onEventRef = useRef(onEvent);

  useEffect(() => {
    onEventRef.current = onEvent;
  });

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

    const socket = new UserSocket({
      baseUrl,
      onEvent: (event) => onEventRef.current(event),
      onStatusChange: setStatus,
      refreshAuth: authApi.refreshAccessToken,
      onAuthExpired: () => window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT)),
    });
    socketRef.current = socket;
    socket.connect();

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, []);

  return { status };
}
