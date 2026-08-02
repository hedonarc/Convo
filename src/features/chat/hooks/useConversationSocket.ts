import { useEffect, useRef, useState } from "react";

import { AUTH_EXPIRED_EVENT, authApi } from "@/shared/api";

import { RealtimeSocket } from "../services/RealtimeSocket";
import type {
  IncomingEvent,
  OutgoingAction,
  SocketStatus,
} from "../services/socketEvents";

interface UseConversationSocketResult {
  status: SocketStatus;
  send: (
    action: OutgoingAction["action"],
    data: OutgoingAction["data"],
  ) => void;
}

/**
 * Opens one socket per active conversation. `onEvent` is read through a ref on
 * every frame, so an inline arrow does not re-run the connect effect.
 */
export function useConversationSocket(
  conversationId: number,
  onEvent: (event: IncomingEvent) => void,
): UseConversationSocketResult {
  const [status, setStatus] = useState<SocketStatus>("idle");
  const socketRef = useRef<RealtimeSocket<
    IncomingEvent,
    OutgoingAction
  > | null>(null);
  const onEventRef = useRef(onEvent);

  useEffect(() => {
    onEventRef.current = onEvent;
  });

  useEffect(() => {
    const socket = new RealtimeSocket<IncomingEvent, OutgoingAction>({
      path: `/ws/conversations/${conversationId}/`,
      baseUrl: import.meta.env.VITE_API_URL || "http://localhost:8000",
      onEvent: (event) => onEventRef.current(event),
      onStatusChange: setStatus,
      // An expired access token is worth one refresh-and-retry; if that
      // fails, onAuthExpired matches how the REST interceptor gives up.
      refreshAuth: authApi.refreshAccessToken,
      onAuthExpired: () => window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT)),
    });
    socketRef.current = socket;
    socket.connect();

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [conversationId]);

  const send: UseConversationSocketResult["send"] = (action, data) => {
    socketRef.current?.send({ action, data } as OutgoingAction);
  };

  return { status, send };
}
