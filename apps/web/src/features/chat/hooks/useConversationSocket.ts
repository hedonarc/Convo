import { AUTH_EXPIRED_EVENT, authApi } from "@shared/api";
import { useEffect, useRef, useState } from "react";

import { ConversationSocket } from "../services/ConversationSocket";
import type {
  IncomingEvent,
  OutgoingAction,
  SocketStatus,
} from "../services/socketEvents";

interface UseConversationSocketResult {
  status: SocketStatus;
  send: (action: OutgoingAction["action"], data: OutgoingAction["data"]) => void;
}

/**
 * Opens one ConversationSocket per active conversation. The `onEvent` callback
 * is read via a ref on every frame, so consumers can pass inline arrow
 * functions without re-running the connect effect.
 */
export function useConversationSocket(
  conversationId: number,
  onEvent: (event: IncomingEvent) => void,
): UseConversationSocketResult {
  const [status, setStatus] = useState<SocketStatus>("idle");
  const socketRef = useRef<ConversationSocket | null>(null);
  const onEventRef = useRef(onEvent);

  // Keep the ref pointed at the latest callback so the socket layer always
  // calls the freshest version without re-running the connect effect.
  useEffect(() => {
    onEventRef.current = onEvent;
  });

  useEffect(() => {
    const baseUrl =
      import.meta.env.VITE_API_URL || "http://localhost:8000";

    const socket = new ConversationSocket({
      conversationId,
      baseUrl,
      onEvent: (event) => onEventRef.current(event),
      onStatusChange: setStatus,
      // If the access token has expired, try refreshing and reconnecting once
      // before giving up. If the refresh fails the socket emits onAuthExpired,
      // mirroring the REST interceptor's handling for consistent UX.
      refreshAuth: authApi.refreshAccessToken,
      onAuthExpired: () =>
        window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT)),
    });
    socketRef.current = socket;
    socket.connect();

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [conversationId]);

  const send: UseConversationSocketResult["send"] = (action, data) => {
    socketRef.current?.send(action, data);
  };

  return { status, send };
}
