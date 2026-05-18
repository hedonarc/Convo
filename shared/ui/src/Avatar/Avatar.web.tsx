import { cn } from "@shared/utils";

interface AvatarProps {
  name?: string;
  className?: string;
  size?: "sm" | "default" | "lg";
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

export function Avatar({ name, className, size = "default" }: AvatarProps) {
  return (
    <div
      aria-label={name ?? "User avatar"}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-brand/10 font-semibold text-brand select-none",
        sizeClasses[size],
        className,
      )}
    >
      {getInitials(name)}
    </div>
  );
}
