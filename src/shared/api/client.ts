/// <reference types="vite/client" />
import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  withCredentials: true, // send httpOnly cookies on every request
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Dedicated axios instance for the token-refresh endpoint. Has no response
 * interceptor, so a 401 from `/api/token/refresh/` won't recursively trigger
 * another refresh attempt. Consumers should call `authApi.refreshAccessToken`
 * rather than using this directly.
 */
export const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  withCredentials: true,
});
