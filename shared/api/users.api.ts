import { API_ENDPOINTS } from "@shared/constants";
import type { PaginatedResponse } from "@shared/types/conversation";
import type { User } from "@shared/types/user";
import { apiClient } from "./client";

export const usersApi = {
  searchUsers: async (
    query: string,
    signal?: AbortSignal,
  ): Promise<PaginatedResponse<User>> => {
    const response = await apiClient.get<PaginatedResponse<User>>(
      API_ENDPOINTS.USERS,
      { params: { search: query }, signal },
    );
    return response.data;
  },
};
