import type { PresenceEntry, PresenceMap } from "@shared/types/presence";
import { createContext } from "react";

export interface PresenceContextValue {
  /** Map of user id (string) → presence entry. */
  presence: PresenceMap;
  /** Replace the entire map (used by the initial hydrate). */
  hydrate: (map: PresenceMap) => void;
  /** Merge a single presence update from a socket frame. */
  apply: (entry: PresenceEntry) => void;
}

export const PresenceContext = createContext<PresenceContextValue | null>(null);
