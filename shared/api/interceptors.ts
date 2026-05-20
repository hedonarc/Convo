import axios from "axios";
import { API_ENDPOINTS } from "@shared/constants";
import { apiClient } from "./client";

let isRefreshing = false;
type QueueItem = {
  resolve: (value: any) => void;
  reject: (error: any) => void;
};
let failedQueue: QueueItem[] = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(null)));
  failedQueue = [];
};

const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  withCredentials: true,
});

export function setupInterceptors() {
  apiClient.interceptors.response.use(
    (res) => res,
    async (error) => {
      const originalRequest = error.config;

      // Prevent infinite retry loop
      const isRefreshRequest =
        originalRequest.url === API_ENDPOINTS.TOKEN_REFRESH;

      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        !isRefreshRequest
      ) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => apiClient(originalRequest))
            .catch((e) => Promise.reject(e));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          await refreshClient.post(API_ENDPOINTS.TOKEN_REFRESH);

          processQueue(null);

          return apiClient(originalRequest);
        } catch (err) {
          processQueue(err);
          localStorage.clear()
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    },
  );
}