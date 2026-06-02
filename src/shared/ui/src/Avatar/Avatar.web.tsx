import { useEffect, useState } from "react";

import { cn } from "@/shared/utils";

export type AvatarPresenceStatus = "online" | "away" | "offline";

interface AvatarProps {
  name?: string;
  className?: string;
  size?: "sm" | "default" | "lg" | "xl";
  url?: string;
  /**
   * Optional presence indicator rendered as a colored dot in the bottom-right
   * corner. Omit (or pass undefined) to hide it entirely — only callers that
   * actually have presence state should set it.
   */
  presence?: AvatarPresenceStatus;
  /** aria-label for the presence dot. Falls back to the status name. */
  presenceLabel?: string;
}

const sizeClasses = {
  sm: "h-7 w-7 text-xs",
  default: "h-9 w-9 text-sm",
  lg: "h-12 w-12 text-base",
  // Hero size for the Profile page. 128px matches the rough size most
  // premium profile pages use (LinkedIn, Slack, Notion) — large enough to
  // anchor the page but not so large it dominates on smaller viewports.
  xl: "h-32 w-32 text-3xl",
};

const dotSizeClasses = {
  sm: "h-2 w-2",
  default: "h-2.5 w-2.5",
  lg: "h-3 w-3",
  xl: "h-5 w-5",
};

const dotColorClasses: Record<AvatarPresenceStatus, string> = {
  // Semantic feedback exceptions per DESIGN.md — green for online, yellow
  // for away, gray for offline. The bg-surface ring (set on the dot element)
  // separates the dot from the avatar in both themes.
  online: "bg-green-500 dark:bg-green-400",
  away: "bg-yellow-500 dark:bg-yellow-400",
  offline: "bg-gray-400 dark:bg-gray-500",
};

function getInitials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function Avatar({
  name,
  className,
  size = "default",
  url,
  presence,
  presenceLabel,
}: AvatarProps) {
  // Track image load failures so we fall back to initials instead of showing
  // the browser's broken-image glyph. Reset whenever the url changes so a
  // recovered avatar URL is given a fresh chance to load.
  // Pre-existing pattern — flagged by react-hooks/set-state-in-effect under
  // newer plugin versions but still functionally correct; the canonical
  // "store previous prop" rewrite is out of scope for this refactor.
  const [loadFailed, setLoadFailed] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadFailed(false);
  }, [url]);

  // Treat empty string and the literal string "undefined" as no-url; both can
  // sneak in from optimistic fields or stale serializers and produce a 404.
  const hasValidUrl = !!url && url !== "undefined" && url !== "null";
  const showImage = hasValidUrl && !loadFailed;

  return (
    <div className={cn("relative shrink-0", className)}>
      <div
        aria-label={name ?? "User avatar"}
        className={cn(
          "center bg-brand/10 text-brand overflow-hidden rounded-full font-semibold select-none",
          sizeClasses[size],
        )}
      >
        {showImage ? (
          <img
            src={url}
            alt=""
            onError={() => setLoadFailed(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          getInitials(name)
        )}
      </div>
      {presence && (
        <span className="group/presence absolute right-0 bottom-0 block">
          <span
            role="status"
            aria-label={presenceLabel ?? presence}
            className={cn(
              "ring-surface block rounded-full ring-2",
              dotSizeClasses[size],
              dotColorClasses[presence],
            )}
          />
          <span
            role="tooltip"
            className={cn(
              "border-border bg-surface text-text-primary pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded border px-2 py-0.5 text-xs font-medium whitespace-nowrap opacity-0 shadow-md transition-opacity",
              "group-hover/presence:opacity-100",
            )}
          >
            {presenceLabel ?? presence}
          </span>
        </span>
      )}
    </div>
  );
}
