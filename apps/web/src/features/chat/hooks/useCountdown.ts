import { formatCooldown } from "@shared/utils";
import { useEffect, useState } from "react";

/**
 * Returns the formatted time remaining until `targetMs`, advancing every
 * `intervalMs`. Returns null once elapsed or when there is no target. Follows
 * React's clock pattern: wall-clock time lives in state and is moved forward by
 * the interval callback, so render stays pure and the effect has no setState.
 */
export function useCountdown(
  targetMs: number | null,
  intervalMs = 1000,
): string | null {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (targetMs === null) return;
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [targetMs, intervalMs]);

  if (targetMs === null) return null;
  const diff = targetMs - now;
  return diff > 0 ? formatCooldown(diff) : null;
}
