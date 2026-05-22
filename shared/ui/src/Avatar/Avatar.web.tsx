import { cn } from "@shared/utils";
import { useEffect, useState } from "react";

interface AvatarProps {
  name?: string;
  className?: string;
  size?: "sm" | "default" | "lg";
  url?: string;
}

const sizeClasses = {
  sm: "h-7 w-7 text-xs",
  default: "h-9 w-9 text-sm",
  lg: "h-12 w-12 text-base",
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
    <div
      aria-label={name ?? "User avatar"}
      className={cn(
        "center bg-brand/10 text-brand shrink-0 overflow-hidden rounded-full font-semibold select-none",
        sizeClasses[size],
        className,
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
  );
}
