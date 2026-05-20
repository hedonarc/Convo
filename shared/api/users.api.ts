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

  updateMe: async (data: FormData): Promise<User> => {
    const response = await apiClient.patch<User>(API_ENDPOINTS.ME, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  me: async (signal?: AbortSignal): Promise<User> => {
    const response = await apiClient.get<User>(API_ENDPOINTS.ME, { signal });
    return response.data;
  },

  me: async (signal?: AbortSignal): Promise<User> => {
    const response = await apiClient.get<User>(API_ENDPOINTS.ME, { signal });
    return response.data;
  },
};
