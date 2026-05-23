import type { PresenceStatus } from "@shared/types/presence";
import { useContext } from "react";

import { PresenceContext } from "./presence.context";

/**
 * Read full presence context — primarily for places that need to bulk-mutate
 * the map (Chat hydrates and applies socket events).
 */
export function usePresenceContext() {
  const ctx = useContext(PresenceContext);
  if (!ctx)
    throw new Error(
      "usePresenceContext must be used within a <PresenceProvider>",
    );
  return ctx;
}

/**
 * Read the presence status for one user. Returns "offline" when the user
 * isn't tracked (yet to connect, or no shared conversation).
 */
export function usePresence(userId: number | undefined | null): PresenceStatus {
  const { presence } = usePresenceContext();
  if (userId == null) return "offline";
  return presence[String(userId)]?.status ?? "offline";
}
