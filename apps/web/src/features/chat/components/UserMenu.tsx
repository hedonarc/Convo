import { ROUTES } from "@shared/constants";
import { presenceText, sharedText } from "@shared/constants/strings/index.en";
import type { PresenceStatus } from "@shared/types/presence";
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownPortal,
  DropdownSeparator,
  DropdownSub,
  DropdownSubContent,
  DropdownSubTrigger,
  DropdownTrigger,
} from "@shared/ui";
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
  /**
   * The element that opens the menu — typically the sidebar identity tile
   * (avatar + name + chevron). Passed as a child so the caller owns its
   * visual presentation while the menu owns the dropdown logic.
   */
  children: React.ReactNode;
  /** Current user id, used to read own status for the active-state check. */
  userId?: number;
}

/**
 * Account menu hung off whatever the caller provides as a trigger.
 *
 * Identity (name, @handle, status) lives in the sidebar header tile, not
 * inside the menu — so the dropdown is purely actions:
 *
 *   - Set Status submenu (Online / Away)
 *   - View profile
 *   - Theme toggle
 *   - Sign out
 */
export function UserMenu({ children, userId }: UserMenuProps) {
  const { logout } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();
  const { setManualPresence } = usePresenceContext();
  const navigate = useNavigate();

  const ownStatus = usePresence(userId);

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <Dropdown>
      <DropdownTrigger asChild>{children}</DropdownTrigger>
      <DropdownContent align="start" sideOffset={8} className="min-w-[14rem]">
        <DropdownSub>
          <DropdownSubTrigger>
            <span className="flex items-center gap-2">
              <StatusDot status={ownStatus} />
              {presenceText.setStatus}
            </span>
          </DropdownSubTrigger>
          <DropdownPortal>
            <DropdownSubContent className="min-w-[10rem]">
              <DropdownItem onSelect={() => setManualPresence("online")}>
                <StatusDot status="online" />
                {presenceText.online}
                {ownStatus === "online" && <ActiveCheck />}
              </DropdownItem>
              <DropdownItem onSelect={() => setManualPresence("away")}>
                <StatusDot status="away" />
                {presenceText.away}
                {ownStatus === "away" && <ActiveCheck />}
              </DropdownItem>
            </DropdownSubContent>
          </DropdownPortal>
        </DropdownSub>

        <DropdownSeparator />

        <DropdownItem onSelect={() => navigate(ROUTES.PROFILE)}>
          <UserIcon className="h-4 w-4" />
          {sharedText.viewProfile}
        </DropdownItem>

        <DropdownItem onSelect={toggleTheme}>
          {theme === "light" ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
          {theme === "light"
            ? sharedText.switchToDark
            : sharedText.switchToLight}
        </DropdownItem>

        <DropdownSeparator />

        <DropdownItem
          onSelect={handleLogout}
          className="text-red-500 focus:bg-red-50 focus:text-red-500 dark:focus:bg-red-900/10 dark:focus:text-red-400"
        >
          <LogOut className="h-4 w-4" />
          {sharedText.signOut}
        </DropdownItem>
      </DropdownContent>
    </Dropdown>
  );
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
      className={cn("h-2.5 w-2.5 rounded-full", STATUS_DOT_CLASS[status])}
    />
  );
}

function ActiveCheck() {
  return <Check className="text-text-secondary ml-auto h-3.5 w-3.5" />;
}
