import { API_ENDPOINTS } from "@shared/constants";
import type { PaginatedResponse } from "@shared/types/conversation";
import type { Message } from "@shared/types/message";

import { apiClient } from "./client";

export const messagesApi = {
  /**
   * Cursor-paginated message list — 30 per page, newest first.
   * `cursor` is the opaque value extracted from the previous response's `next`
   * URL. Omit on the first call.
   */
  list: async (
    conversationId: number,
    cursor?: string,
    signal?: AbortSignal,
  ): Promise<PaginatedResponse<Message>> => {
    const response = await apiClient.get<PaginatedResponse<Message>>(
      `${API_ENDPOINTS.CONVERSATIONS}${conversationId}/messages/`,
      {
        params: cursor ? { cursor } : undefined,
        signal,
      },
    );
    return response.data;
  },
};
