import axios from "axios";
import { useEffect, useRef, useState } from "react";

export interface UseApiQueryOptions<T> {
  /** Returned when `enabled` is false or before the first fetch resolves. */
  initial: T;
  /** Skip the effect when false (e.g. preconditions not met). Default: true. */
  enabled?: boolean;
  /** Message used when the request fails for any non-cancellation reason. */
  errorMessage?: string;
}

export interface UseApiQueryResult<T> {
  data: T;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Effect-driven fetch with built-in cancellation. Owns the AbortController,
 * swallows axios cancel errors, and guards setState against the post-resolve
 * race. When `enabled` is false the hook returns derived `initial`/`false`/
 * `null` without firing — callers can gate without storing mirror state.
 *
 * `refetch` is awaitable and aborts any in-flight request before starting a
 * new one. Effect and refetch bodies are deliberately inlined so each stays
 * lint-clean under `react-hooks/set-state-in-effect`.
 */
export function useApiQuery<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  deps: React.DependencyList,
  options: UseApiQueryOptions<T>,
): UseApiQueryResult<T> {
  const { initial, enabled = true, errorMessage = "Request failed." } = options;

  const [data, setData] = useState<T>(initial);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    controllerRef.current = controller;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await fetcher(controller.signal);
        if (!controller.signal.aborted) setData(result);
      } catch (err) {
        if (axios.isCancel(err)) return;
        if (!controller.signal.aborted) setError(errorMessage);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };
    load();

    return () => controller.abort();
    // deps are caller-controlled; fetcher/errorMessage intentionally not tracked.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);

  const refetch = async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setIsLoading(true);
    setError(null);
    try {
      const result = await fetcher(controller.signal);
      if (!controller.signal.aborted) setData(result);
    } catch (err) {
      if (axios.isCancel(err)) return;
      if (!controller.signal.aborted) setError(errorMessage);
    } finally {
      if (!controller.signal.aborted) setIsLoading(false);
    }
  };

  return {
    data: enabled ? data : initial,
    isLoading: enabled ? isLoading : false,
    error: enabled ? error : null,
    refetch,
  };
}
