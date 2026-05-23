import { presenceApi } from "@shared/api";
import type { PresenceEntry, PresenceMap } from "@shared/types/presence";
import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";

import { PresenceContext } from "./presence.context";

/**
 * Holds the per-user presence map. Hydrated from /api/presence/ on mount
 * and kept in sync by the Chat page, which pipes `presence_changed` socket
 * frames into `apply()`.
 *
 * Mounted inside AuthLayout, so the user is always authenticated here —
 * no need to guard the fetch on auth state. Logout unmounts the provider
 * which drops the map naturally.
 *
 * Kept dumb on purpose — does not touch the WebSocket itself. The socket
 * lives in the Chat tree; this provider just owns the state so any
 * component (Avatar in many places) can read it.
 */
export function PresenceProvider({ children }: { children: React.ReactNode }) {
  const [presence, setPresence] = useState<PresenceMap>({});

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const map = await presenceApi.getPresence(controller.signal);
        if (!controller.signal.aborted) setPresence(map);
      } catch (err) {
        if (axios.isCancel(err)) return;
        // Non-fatal — sockets will fill in as users transition.
      }
    })();
    return () => controller.abort();
  }, []);

  const hydrate = useCallback((map: PresenceMap) => setPresence(map), []);

  const apply = useCallback((entry: PresenceEntry) => {
    setPresence((current) => ({ ...current, [String(entry.user_id)]: entry }));
  }, []);

  const value = useMemo(
    () => ({ presence, hydrate, apply }),
    [presence, hydrate, apply],
  );

  return (
    <PresenceContext.Provider value={value}>
      {children}
    </PresenceContext.Provider>
  );
}
