import { conversationsApi } from "@shared/api";
import type { Conversation } from "@shared/types/conversation";

import { useApiQuery } from "./useApiQuery";

interface UseConversationsResult {
  conversations: Conversation[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useConversations(): UseConversationsResult {
  const { data, isLoading, error, refetch } = useApiQuery(
    async (signal) => (await conversationsApi.getConversations(signal)).results,
    [],
    {
      initial: [] as Conversation[],
      errorMessage: "Failed to load conversations. Please try again.",
    },
  );

  return { conversations: data, isLoading, error, refetch };
}
