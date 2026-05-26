import { conversationsApi } from "@shared/api";
import { errorText } from "@shared/constants/strings/index.en";
import type { Conversation } from "@shared/types/conversation";
import axios from "axios";
import { useEffect, useState } from "react";

interface UseConversationsResult {
  conversations: Conversation[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  /**
   * Merge a server-pushed conversation snapshot into the list. Used by the
   * per-user WebSocket channel (`conversation_updated` events) to keep the
   * sidebar live without polling.
   *
   * - If the conversation is already in the list, its entry is replaced.
   * - If not, it's inserted (e.g. a brand-new chat after invite-accept).
   * - The list is re-sorted by `updated_at` descending so the freshest
   *   conversation rises to the top.
   */
  applyUpdate: (conversation: Conversation) => void;
}

/**
 * Owns the conversation-list state directly (rather than going through
 * `useApiQuery`) because we now need to mutate the list from outside the
 * fetcher — specifically, the user-channel WebSocket calls `applyUpdate` for
 * every cross-conversation push. `useApiQuery`'s single-value-replace model
 * doesn't fit that, so this hook keeps its own state.
 */
export function useConversations(): UseConversationsResult {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        const data = await conversationsApi.getConversations(controller.signal);
        if (!controller.signal.aborted) {
          setConversations(data.results);
          setError(null);
        }
      } catch (err) {
        if (axios.isCancel(err)) return;
        if (!controller.signal.aborted) {
          setError(errorText.loadConversationsFailed);
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, []);

  const refetch = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await conversationsApi.getConversations();
      setConversations(data.results);
    } catch {
      setError("Failed to load conversations. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const applyUpdate = (updated: Conversation) => {
    setConversations((prev) => {
      const exists = prev.some((c) => c.id === updated.id);
      const merged = exists
        ? prev.map((c) => (c.id === updated.id ? updated : c))
        : [updated, ...prev];
      return merged.sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      );
    });
  };

  return { conversations, isLoading, error, refetch, applyUpdate };
}
