import { createContext } from "react";

import type {
  PresenceEntry,
  PresenceMap,
  PresenceStatus,
} from "@/shared/types/presence";

export interface PresenceContextValue {
  /** Map of user id (string) → presence entry. */
  presence: PresenceMap;
  /** Replace the entire map (used by the initial hydrate). */
  hydrate: (map: PresenceMap) => void;
  /** Merge a single presence update from a socket frame. */
  apply: (entry: PresenceEntry) => void;
  /**
   * Fire an explicit `set_status` frame — the user actively chose
   * online/away via the account menu. Records a user-level manual
   * override on the server that survives tab focus events and WS
   * reconnects until the user clears it (by choosing online again) or
   * their last tab disconnects. No-op until Chat registers the sender
   * via `registerStatusSender`.
   *
   * Pass "offline" to no-op (presence "offline" can only come from the
   * server when the socket drops).
   */
  setManualPresence: (status: PresenceStatus) => void;
  /**
   * Internal — Chat calls this on mount/unmount with a function that
   * forwards `visibility` frames over the user socket. Used by the
   * browser's `visibilitychange` listener to keep the per-tab state in
   * sync.
   */
  registerVisibilitySender: (send: ((visible: boolean) => void) | null) => void;
  /**
   * Internal — same pattern, but for explicit `set_status` frames. The
   * two senders are kept separate because the backend treats them
   * differently: visibility is a tab hint, set_status is durable user
   * intent.
   */
  registerStatusSender: (
    send: ((status: "online" | "away") => void) | null,
  ) => void;
}

export const PresenceContext = createContext<PresenceContextValue | null>(null);
