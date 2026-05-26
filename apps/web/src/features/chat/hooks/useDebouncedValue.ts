import { useEffect, useState } from "react";

/**
 * Returns `value` delayed by `delayMs`. The state update lives in the timeout
 * callback (not the effect body), so it stays free of setState-in-effect.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}
