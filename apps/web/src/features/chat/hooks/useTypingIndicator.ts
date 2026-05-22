import { useEffect, useRef, useState } from "react";

import type { OutgoingAction } from "../services/socketEvents";

interface UseTypingIndicatorOptions {
  send: (
    action: OutgoingAction["action"],
    data: OutgoingAction["data"],
  ) => void;
}

interface UseTypingIndicatorResult {
  /** Set of peer user-ids currently considered "typing". */
  typingUserIds: number[];
  /** Call from the composer's onChange to emit a throttled `is_typing: true`. */
  notifyTyping: () => void;
  /** Call when an incoming `typing` frame is received. */
  applyTypingEvent: (userId: number, isTyping: boolean) => void;
}

const SEND_INTERVAL_MS = 3000; // throttle outgoing pings to once per 3s
const STALE_TIMEOUT_MS = 5000; // peer counts as "not typing" after 5s silent

/**
 * Throttles outgoing typing pings and aggregates incoming ones so the UI can
 * render "X is typing…" without coupling to the socket layer. Each incoming
 * `is_typing: true` extends the peer's expiration; missing `is_typing: false`
 * frames are tolerated by the stale-timeout sweep.
 */
export function useTypingIndicator({
  send,
}: UseTypingIndicatorOptions): UseTypingIndicatorResult {
  const [typingUserIds, setTypingUserIds] = useState<number[]>([]);

  // Per-user expiry timestamps; ref so updates don't trigger renders.
  const expirationsRef = useRef<Map<number, number>>(new Map());
  const lastSentRef = useRef<number>(0);
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notifyTyping = () => {
    const now = Date.now();
    if (now - lastSentRef.current > SEND_INTERVAL_MS) {
      send("typing", { is_typing: true });
      lastSentRef.current = now;
    }
    if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
    stopTimerRef.current = setTimeout(() => {
      send("typing", { is_typing: false });
      lastSentRef.current = 0;
    }, SEND_INTERVAL_MS);
  };

  const applyTypingEvent = (userId: number, isTyping: boolean) => {
    const expirations = expirationsRef.current;
    if (isTyping) {
      expirations.set(userId, Date.now() + STALE_TIMEOUT_MS);
    } else {
      expirations.delete(userId);
    }
    setTypingUserIds(Array.from(expirations.keys()));
  };

  // Sweep stale entries; runs only while at least one peer is typing.
  useEffect(() => {
    if (typingUserIds.length === 0) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const expirations = expirationsRef.current;
      let changed = false;
      for (const [userId, expiresAt] of expirations) {
        if (expiresAt <= now) {
          expirations.delete(userId);
          changed = true;
        }
      }
      if (changed) setTypingUserIds(Array.from(expirations.keys()));
    }, 1000);
    return () => clearInterval(interval);
  }, [typingUserIds.length]);

  // Cancel any in-flight "stopped" send if we unmount.
  useEffect(() => {
    return () => {
      if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
    };
  }, []);

  return { typingUserIds, notifyTyping, applyTypingEvent };
}
