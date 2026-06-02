import { API_ENDPOINTS } from "@/shared/constants";
import type { User } from "@/shared/types/user";

import { apiClient, refreshClient } from "./client";

interface LoginData {
  username?: string;
  email?: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
  first_name?: string;
  last_name?: string;
}

interface AuthResponse {
  message: string;
  user: User;
}

export const authApi = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.LOGIN,
      data,
    );
    return response.data; // token set as httpOnly cookie by server
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.REGISTER,
      data,
    );
    return response.data; // token set as httpOnly cookie by server
  },

  logout: async (): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.LOGOUT);
  },

  /**
   * Trade the httpOnly refresh cookie for a fresh access cookie. Uses
   * `refreshClient` so a 401 from this endpoint cannot recursively trigger
   * the response interceptor's own refresh logic. Resolves on success,
   * rejects on failure — caller decides how to react (e.g. dispatching
   * `AUTH_EXPIRED_EVENT`).
   */
  refreshAccessToken: async (): Promise<void> => {
    await refreshClient.post(API_ENDPOINTS.TOKEN_REFRESH);
  },
};
