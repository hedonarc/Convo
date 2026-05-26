export type PresenceStatus = "online" | "away" | "offline";

export interface PresenceEntry {
  user_id: number;
  status: PresenceStatus;
  /** ISO timestamp of the last presence transition, or null if never seen. */
  last_seen_at: string | null;
}

/** Keyed by user id (as string, because JSON). */
export type PresenceMap = Record<string, PresenceEntry>;
