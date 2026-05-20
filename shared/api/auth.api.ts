import { API_ENDPOINTS } from "@shared/constants";
import type { User } from "@shared/types/user";
import { apiClient } from "./client";

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
    const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.LOGIN, data);
    return response.data; // token set as httpOnly cookie by server
  },

  me: async (): Promise<User> => {
    const response = await apiClient.get<User>(API_ENDPOINTS.ME);
    return response.data;
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
};
