import { conversationsApi } from "@shared/api";
import type { Conversation } from "@shared/types/conversation";
import { useEffect, useState } from "react";

interface UseConversationsResult {
  conversations: Conversation[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useConversations(): UseConversationsResult {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = async () => {
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

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await conversationsApi.getConversations();
        if (!cancelled) setConversations(data.results);
      } catch {
        if (!cancelled)
          setError("Failed to load conversations. Please try again.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { conversations, isLoading, error, refetch: fetchConversations };
}
