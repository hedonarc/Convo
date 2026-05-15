/// <reference path="../../apps/web/node_modules/vite/client.d.ts" />
import axios from "axios";
import { API_ENDPOINTS } from "@shared/constants";

// Configure base URL based on your Django backend.
// For local development, it's typically http://localhost:8000 or similar.
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

export const authApi = {
  login: async (data: any) => {
    const response = await apiClient.post(API_ENDPOINTS.LOGIN, data);
    return response.data;
  },
  register: async (data: any) => {
    const response = await apiClient.post(API_ENDPOINTS.REGISTER, data);
    return response.data;
  },
};
