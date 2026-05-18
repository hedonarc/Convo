import { conversationsApi } from "@shared/api";
import type { Conversation } from "@shared/types/conversation";
import { useCallback, useEffect, useState } from "react";

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

  const fetchConversations = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return { conversations, isLoading, error, refetch: fetchConversations };
}
