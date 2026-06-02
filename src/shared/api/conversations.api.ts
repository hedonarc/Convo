import { API_ENDPOINTS } from "@/shared/constants";
import type {
  Conversation,
  PaginatedResponse,
  StartConversationResponse,
} from "@/shared/types/conversation";
import type { InviteResolveResponse } from "@/shared/types/invite";

import { apiClient } from "./client";

export const conversationsApi = {
  getConversations: async (
    signal?: AbortSignal,
  ): Promise<PaginatedResponse<Conversation>> => {
    const response = await apiClient.get<PaginatedResponse<Conversation>>(
      API_ENDPOINTS.CONVERSATIONS,
      { signal },
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

  createInvite: async (email: string): Promise<Conversation> => {
    const response = await apiClient.post<Conversation>(API_ENDPOINTS.INVITES, {
      email,
    });
    return response.data;
  },

  resolveInvite: async (token: string): Promise<InviteResolveResponse> => {
    const response = await apiClient.get<InviteResolveResponse>(
      `${API_ENDPOINTS.INVITES}${token}/`,
    );
    return response.data;
  },

  acceptInvite: async (token: string): Promise<Conversation> => {
    const response = await apiClient.post<Conversation>(
      `${API_ENDPOINTS.INVITES}${token}/accept/`,
    );
    return response.data;
  },
};
