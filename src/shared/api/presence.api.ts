import { API_ENDPOINTS } from "@/shared/constants";
import type { PresenceMap } from "@/shared/types/presence";

import { apiClient } from "./client";

export const presenceApi = {
  /** Initial snapshot for the caller's conversation peers + self. */
  getPresence: async (signal?: AbortSignal): Promise<PresenceMap> => {
    const response = await apiClient.get<PresenceMap>(API_ENDPOINTS.PRESENCE, {
      signal,
    });
    return response.data;
  },
};
