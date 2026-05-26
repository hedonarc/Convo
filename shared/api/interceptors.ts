import { authApi } from "./auth.api";
import { apiClient } from "./client";

export const AUTH_EXPIRED_EVENT = "auth:expired";

let isRefreshing = false;
type QueueItem = {
  resolve: () => void;
  reject: (error: unknown) => void;
};
let failedQueue: QueueItem[] = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve()));
  failedQueue = [];
};

export function setupInterceptors() {
  apiClient.interceptors.response.use(
    (res) => res,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise<void>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => apiClient(originalRequest))
            .catch((e) => Promise.reject(e));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          await authApi.refreshAccessToken();
          processQueue(null);
          return apiClient(originalRequest);
        } catch (err) {
          processQueue(err);
          // Signal session loss; AuthProvider listens and clears React state,
          // route guards then redirect declaratively via <Navigate>.
          window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    },
  );
}
