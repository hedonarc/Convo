import { API_ENDPOINTS } from "@shared/constants";
import type {
  Conversation,
  PaginatedResponse,
  StartConversationResponse,
} from "@shared/types/conversation";
import { apiClient } from "./client";

export const conversationsApi = {
  getConversations: async (): Promise<PaginatedResponse<Conversation>> => {
    const response =
      await apiClient.get<PaginatedResponse<Conversation>>(
        API_ENDPOINTS.CONVERSATIONS,
      );
    return response.data;
  },

  createConversation: async (
    userId: number,
  ): Promise<StartConversationResponse> => {
    const response = await apiClient.post<StartConversationResponse>(
      API_ENDPOINTS.CONVERSATIONS,
      { user_id: userId },
    );
    return response.data;
  },
};
