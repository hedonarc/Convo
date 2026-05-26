import type {
  PresenceEntry,
  PresenceMap,
  PresenceStatus,
} from "@shared/types/presence";
import { createContext } from "react";

export interface PresenceContextValue {
  /** Map of user id (string) → presence entry. */
  presence: PresenceMap;
  /** Replace the entire map (used by the initial hydrate). */
  hydrate: (map: PresenceMap) => void;
  /** Merge a single presence update from a socket frame. */
  apply: (entry: PresenceEntry) => void;
  /**
   * Fire a one-shot visibility frame to flip the current user's status on
   * the backend. No-op until Chat registers its WS sender via
   * `registerVisibilitySender`. The auto visibilitychange listener still
   * runs in the background, so this is a manual override that's overruled
   * by the next real tab focus/blur — by design, not a sticky mode.
   *
   * Pass "offline" to no-op (presence "offline" can only come from the
   * server when the socket drops).
   */
  setManualPresence: (status: PresenceStatus) => void;
  /**
   * Internal — Chat calls this on mount/unmount with the user socket's
   * send function. Lives on the provider so UI components don't have to
   * thread the socket down through props.
   */
  registerVisibilitySender: (send: ((visible: boolean) => void) | null) => void;
}

export const PresenceContext = createContext<PresenceContextValue | null>(null);
