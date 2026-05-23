import { cn } from "@shared/utils";
import { useEffect, useState } from "react";

export type AvatarPresenceStatus = "online" | "away" | "offline";

interface AvatarProps {
  name?: string;
  className?: string;
  size?: "sm" | "default" | "lg";
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
};

const dotSizeClasses = {
  sm: "h-2 w-2",
  default: "h-2.5 w-2.5",
  lg: "h-3 w-3",
};

const dotColorClasses: Record<AvatarPresenceStatus, string> = {
  // Semantic feedback exceptions per DESIGN.md — green for online, yellow
  // for away, gray for offline. Using the bg-surface ring so the dot reads
  // cleanly on top of the avatar in both light and dark mode.
  online: "bg-green-500",
  away: "bg-yellow-500",
  offline: "",
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
  const [loadFailed, setLoadFailed] = useState(false);
  useEffect(() => {
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
        <span
          role="status"
          aria-label={presenceLabel ?? presence}
          className={cn(
            "ring-surface absolute right-0 bottom-0 rounded-full ring-2",
            dotSizeClasses[size],
            dotColorClasses[presence],
          )}
        />
      )}
    </div>
  );
}
