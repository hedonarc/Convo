import { messagesApi } from "@shared/api";
import type { Message } from "@shared/types/message";
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
          setError("Failed to load messages. Please try again.");
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

  return {
    messages,
    isLoading,
    isLoadingMore,
    error,
    hasMore: nextCursor !== null,
    loadOlder,
    retry,
  };
}

function extractCursor(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).searchParams.get("cursor");
  } catch {
    return null;
  }
}
