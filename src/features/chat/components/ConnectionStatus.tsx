import { connectionText } from "@/shared/constants/strings/index.en";
import { cn } from "@/shared/utils";

import type { SocketStatus } from "../services/socketEvents";

interface ConnectionStatusProps {
  status: SocketStatus;
}

/**
 * Floating pill that appears above the composer when the socket isn't open.
 * Hidden during `idle` (pre-connect) and `open` (steady state) so it doesn't
 * flash on every mount.
 */
export function ConnectionStatus({ status }: ConnectionStatusProps) {
  if (status === "open" || status === "idle") return null;

  const isTerminal = status === "closed";
  const label = isTerminal
    ? connectionText.disconnected
    : status === "reconnecting"
      ? connectionText.reconnecting
      : connectionText.connecting;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center">
      <div
        role="status"
        className={cn(
          "pointer-events-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
          isTerminal
            ? "bg-red-50 text-red-500 dark:bg-red-900/10 dark:text-red-400"
            : "bg-brand/10 text-brand",
        )}
      >
        {!isTerminal && (
          <span
            aria-hidden
            className="bg-brand inline-block h-1.5 w-1.5 animate-pulse rounded-full"
          />
        )}
        {label}
      </div>
    </div>
  );
}
