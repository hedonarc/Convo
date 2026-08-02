import { useCallback, useEffect, useRef, useState } from "react";

import { AUTH_EXPIRED_EVENT, authApi } from "@/shared/api";

import { RealtimeSocket } from "../services/RealtimeSocket";
import type { SocketStatus } from "../services/socketEvents";
import type {
  UserSocketEvent,
  UserSocketOutgoing,
} from "../services/userSocketEvents";

interface UseUserSocketResult {
  status: SocketStatus;
  send: (frame: UserSocketOutgoing) => void;
}

/**
 * One socket per logged-in user, carrying pushes that span conversations.
 *
 * `onEvent` is read through a ref so an inline arrow does not re-run the
 * connect effect. `send` is a stable reference, safe to depend on.
 */
export function useUserSocket(
  onEvent: (event: UserSocketEvent) => void,
): UseUserSocketResult {
  const [status, setStatus] = useState<SocketStatus>("idle");
  const socketRef = useRef<RealtimeSocket<
    UserSocketEvent,
    UserSocketOutgoing
  > | null>(null);
  const onEventRef = useRef(onEvent);

  useEffect(() => {
    onEventRef.current = onEvent;
  });

  useEffect(() => {
    const socket = new RealtimeSocket<UserSocketEvent, UserSocketOutgoing>({
      path: "/ws/user/",
      baseUrl: import.meta.env.VITE_API_URL || "http://localhost:8000",
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

  const send = useCallback((frame: UserSocketOutgoing) => {
    socketRef.current?.send(frame);
  }, []);

  return { status, send };
}
