import { useEffect, useRef, useState } from "react";

import type { OutgoingAction } from "../services/socketEvents";

type Send = (
  action: OutgoingAction["action"],
  data: OutgoingAction["data"],
) => void;

interface UseTypingIndicatorResult {
  /** Set of peer user-ids currently considered "typing". */
  typingUserIds: number[];
  /**
   * Call from the composer's onChange with the live `send` function. The hook
   * throttles outgoing `typing` pings (once per 3s) and schedules a stop
   * frame 3s after the last keystroke. `send` is taken per-call so this
   * hook can be declared before the socket hook that produces it.
   */
  notifyTyping: (send: Send) => void;
  /**
   * Call when the user explicitly finishes typing — e.g. just sent a message
   * or cleared the composer. Cancels the pending deferred stop frame and
   * emits `is_typing: false` immediately, so peers don't keep seeing the
   * stale "is typing…" dot for up to 3s after a send.
   */
  notifyStopped: (send: Send) => void;
  /** Call when an incoming `typing` frame is received. */
  applyTypingEvent: (userId: number, isTyping: boolean) => void;
  /**
   * Mark a peer as no longer typing locally. Used as a safety net when a
   * message from that peer arrives — the new message implies they pressed
   * Send, even if the explicit stop frame races / drops.
   */
  clearTyping: (userId: number) => void;
}

const SEND_INTERVAL_MS = 3000;
const STALE_TIMEOUT_MS = 5000;

/**
 * Throttles outgoing typing pings and aggregates incoming ones so the UI can
 * render "X is typing…" without coupling to the socket layer.
 */
export function useTypingIndicator(): UseTypingIndicatorResult {
  const [typingUserIds, setTypingUserIds] = useState<number[]>([]);

  const expirationsRef = useRef<Map<number, number>>(new Map());
  const lastSentRef = useRef<number>(0);
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sendRef = useRef<Send | null>(null);

  const notifyTyping: UseTypingIndicatorResult["notifyTyping"] = (send) => {
    // Capture the latest send for the deferred "stop" frame.
    sendRef.current = send;

    const now = Date.now();
    if (now - lastSentRef.current > SEND_INTERVAL_MS) {
      send("typing", { is_typing: true });
      lastSentRef.current = now;
    }
    if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
    stopTimerRef.current = setTimeout(() => {
      sendRef.current?.("typing", { is_typing: false });
      lastSentRef.current = 0;
    }, SEND_INTERVAL_MS);
  };

  const notifyStopped: UseTypingIndicatorResult["notifyStopped"] = (send) => {
    if (stopTimerRef.current) {
      clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }
    // Only emit a stop frame if we'd previously announced typing in this
    // throttle window — otherwise peers never saw us as typing to begin with.
    if (lastSentRef.current > 0) {
      send("typing", { is_typing: false });
      lastSentRef.current = 0;
    }
  };

  const applyTypingEvent: UseTypingIndicatorResult["applyTypingEvent"] = (
    userId,
    isTyping,
  ) => {
    const expirations = expirationsRef.current;
    if (isTyping) {
      expirations.set(userId, Date.now() + STALE_TIMEOUT_MS);
    } else {
      expirations.delete(userId);
    }
    setTypingUserIds(Array.from(expirations.keys()));
  };

  const clearTyping: UseTypingIndicatorResult["clearTyping"] = (userId) => {
    const expirations = expirationsRef.current;
    if (!expirations.has(userId)) return;
    expirations.delete(userId);
    setTypingUserIds(Array.from(expirations.keys()));
  };

  // Sweep stale entries while at least one peer is typing.
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

  useEffect(() => {
    return () => {
      if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
    };
  }, []);

  return {
    typingUserIds,
    notifyTyping,
    notifyStopped,
    applyTypingEvent,
    clearTyping,
  };
}
