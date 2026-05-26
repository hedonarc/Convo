import { messagesApi } from "@shared/api";
import { errorText } from "@shared/constants/strings/index.en";
import type { Message, PendingMessage } from "@shared/types/message";
import axios from "axios";
import { useEffect, useRef, useState } from "react";

interface UseMessagesResult {
  messages: Message[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  loadOlder: () => Promise<void>;
  retry: () => void;
  /** Append a live (WebSocket-delivered) message; no-op if id already present. */
  appendIncoming: (message: Message) => void;
  /**
   * Replace a known message in place. Used for `message_edited` and
   * `message_deleted` WS events. No-op if the id isn't currently in the list
   * (e.g. the edit affected an older page we haven't loaded yet).
   */
  applyMessageUpdate: (message: Message) => void;
  /** Outgoing messages awaiting a server echo. */
  pendingMessages: PendingMessage[];
  /** Insert an optimistic outgoing message; returns the generated clientId. */
  addPending: (content: string) => string;
  /**
   * Drop the first pending message whose content matches; called when the
   * server echo of our own send arrives. Returns true if a match was removed.
   */
  reconcilePending: (content: string) => boolean;
}

/**
 * Pulls the latest page of messages and exposes `loadOlder` for cursor
 * pagination. Backend returns newest-first; we store oldest-first for natural
 * top-to-bottom rendering, so each page is `reverse()`d before insertion.
 *
 * Phase 2 will extend this with `appendIncoming` for WebSocket-delivered
 * messages and de-duplication against optimistic sends.
 */
export function useMessages(conversationId: number): UseMessagesResult {
  const [messages, setMessages] = useState<Message[]>([]);
  const [pending, setPending] = useState<PendingMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const loadOlderController = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await messagesApi.list(
          conversationId,
          undefined,
          controller.signal,
        );
        if (controller.signal.aborted) return;
        setMessages([...data.results].reverse());
        setNextCursor(extractCursor(data.next));
      } catch (err) {
        if (axios.isCancel(err)) return;
        if (!controller.signal.aborted) {
          setError(errorText.loadMessagesFailed);
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };
    load();

    return () => {
      controller.abort();
      loadOlderController.current?.abort();
    };
  }, [conversationId, version]);

  const loadOlder = async () => {
    if (!nextCursor || isLoadingMore) return;

    loadOlderController.current?.abort();
    const controller = new AbortController();
    loadOlderController.current = controller;

    setIsLoadingMore(true);
    try {
      const data = await messagesApi.list(
        conversationId,
        nextCursor,
        controller.signal,
      );
      if (controller.signal.aborted) return;
      // Older page is also newest-first within itself; reverse to oldest-first
      // and prepend so the list stays chronological top→bottom.
      setMessages((prev) => [...[...data.results].reverse(), ...prev]);
      setNextCursor(extractCursor(data.next));
    } catch (err) {
      if (axios.isCancel(err)) return;
      // Soft fail — scroll back up to retry.
    } finally {
      if (!controller.signal.aborted) setIsLoadingMore(false);
    }
  };

  const retry = () => setVersion((v) => v + 1);

  const appendIncoming = (message: Message) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === message.id)) return prev;
      return [...prev, message];
    });
  };

  const applyMessageUpdate = (message: Message) => {
    setMessages((prev) => {
      const idx = prev.findIndex((m) => m.id === message.id);
      if (idx === -1) return prev;
      const next = prev.slice();
      next[idx] = message;
      return next;
    });
  };

  const addPending = (content: string): string => {
    const clientId = generateClientId();
    setPending((prev) => [
      ...prev,
      {
        clientId,
        content,
        status: "sending",
        createdAt: new Date().toISOString(),
      },
    ]);
    return clientId;
  };

  const reconcilePending = (content: string): boolean => {
    // Closure read of `pending` is safe because frames are processed one at a
    // time within a single render cycle.
    const idx = pending.findIndex(
      (p) => p.content === content && p.status === "sending",
    );
    if (idx === -1) return false;
    setPending((prev) => prev.filter((_, i) => i !== idx));
    return true;
  };

  return {
    messages,
    isLoading,
    isLoadingMore,
    error,
    hasMore: nextCursor !== null,
    loadOlder,
    retry,
    appendIncoming,
    applyMessageUpdate,
    pendingMessages: pending,
    addPending,
    reconcilePending,
  };
}

function generateClientId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // Sufficient for the lifetime of a single tab; only used as a React key.
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function extractCursor(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).searchParams.get("cursor");
  } catch {
    return null;
  }
}
