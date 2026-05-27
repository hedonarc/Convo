import { ROUTES } from "@shared/constants";
import { presenceText, sharedText } from "@shared/constants/strings/index.en";
import type { PresenceStatus } from "@shared/types/presence";
import { cn } from "@shared/utils";
import { Check, LogOut, Moon, Sun, User as UserIcon } from "lucide-react";
import { useNavigate } from "react-router";

import {
  useAuth,
  usePresence,
  usePresenceContext,
  useTheme,
} from "@/providers";

interface UserMenuProps {
  /** Controlled open state — owned by the parent so the surrounding
   *  surface (the sidebar header) can grow with us. */
  open: boolean;
  /** Fired after a navigation/destructive item is selected — parent
   *  collapses the panel. NOT fired for sticky items (status, theme). */
  onClose: () => void;
  /** Current user id, used to read own status for the active-state check. */
  userId?: number;
}

/**
 * Inline-collapsible account panel. Lives in-flow inside the sidebar
 * header — when open, the parent surface grows taller to reveal these
 * actions instead of a floating popover.
 *
 * Sticky vs auto-close:
 *  - Status (Online/Away) and theme toggle keep the panel open so the
 *    user sees the ✓ / icon change land before deciding to dismiss.
 *  - View profile and Sign out close the panel (they navigate away
 *    anyway, but explicit close keeps things consistent).
 */
export function UserMenu({ open, onClose, userId }: UserMenuProps) {
  const { logout } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();
  const { setManualPresence } = usePresenceContext();
  const navigate = useNavigate();
  const ownStatus = usePresence(userId);

  const goProfile = () => {
    onClose();
    navigate(ROUTES.PROFILE);
  };

  const handleLogout = async () => {
    onClose();
    await logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <div
      data-state={open ? "open" : "closed"}
      className={cn(
        "grid transition-[grid-template-rows] duration-200 ease-out",
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
      )}
    >
      <div className="overflow-hidden">
        <div
          inert={!open}
          className={cn(
            "pb-2 transition-opacity duration-200",
            open ? "opacity-100" : "opacity-0",
          )}
        >
          <MenuItem onClick={() => setManualPresence("online")}>
            <StatusDot status="online" />
            {presenceText.online}
            {ownStatus === "online" && <ActiveCheck />}
          </MenuItem>
          <MenuItem onClick={() => setManualPresence("away")}>
            <StatusDot status="away" />
            {presenceText.away}
            {ownStatus === "away" && <ActiveCheck />}
          </MenuItem>

          <Separator />

          <MenuItem onClick={goProfile}>
            <UserIcon className="h-4 w-4" />
            {sharedText.viewProfile}
          </MenuItem>

          <MenuItem onClick={toggleTheme}>
            {theme === "light" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
            {theme === "light"
              ? sharedText.switchToDark
              : sharedText.switchToLight}
          </MenuItem>

          <Separator />

          <MenuItem
            onClick={handleLogout}
            className="hover:bg-red-50 hover:text-red-500 focus-visible:bg-red-50 focus-visible:text-red-500 dark:hover:bg-red-900/10 dark:focus-visible:bg-red-900/10"
          >
            <LogOut className="h-4 w-4" />
            {sharedText.signOut}
          </MenuItem>
        </div>
      </div>
    </div>
  );
}

function MenuItem({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "text-text-primary hover:bg-brand/10 focus-visible:bg-brand/10 focus-visible:ring-ring flex w-full items-center gap-3 px-4 py-1.5 text-sm transition-colors focus-visible:ring-1 focus-visible:outline-none focus-visible:ring-inset",
        className,
      )}
    >
      {children}
    </button>
  );
}

function Separator() {
  return <div aria-hidden className="bg-border h-px" />;
}

const STATUS_DOT_CLASS: Record<PresenceStatus, string> = {
  online: "bg-green-500 dark:bg-green-400",
  away: "bg-yellow-500 dark:bg-yellow-400",
  offline: "bg-gray-400 dark:bg-gray-500",
};

function StatusDot({ status }: { status: PresenceStatus }) {
  return (
    <span
      aria-hidden
      className={cn("h-4 w-4 rounded-full", STATUS_DOT_CLASS[status])}
    />
  );
}

function ActiveCheck() {
  return <Check className="text-text-secondary ml-auto h-3.5 w-3.5" />;
}
