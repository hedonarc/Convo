import { ROUTES } from "@shared/constants";
import { presenceText, sharedText } from "@shared/constants/strings/index.en";
import type { PresenceStatus } from "@shared/types/presence";
import type { User } from "@shared/types/user";
import {
  Avatar,
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownLabel,
  DropdownSeparator,
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
  user: User | null;
  fullName?: string;
}

/**
 * Account menu rooted on the sidebar avatar. Hosts the actions that used to
 * be scattered across the floating top-right chrome and the sidebar footer:
 * View profile, theme toggle, sign out. Replaces both surfaces.
 */
export function UserMenu({ user, fullName }: UserMenuProps) {
  const { logout } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();
  const { setManualPresence } = usePresenceContext();
  const navigate = useNavigate();

  // Own status — drives both the header subtext and the colored dot beside
  // the Status section's selected option.
  const ownStatus = usePresence(user?.id);

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <Dropdown>
      <DropdownTrigger asChild>
        <button
          type="button"
          aria-label={sharedText.userMenuAriaLabel}
          className="focus-visible:ring-ring rounded-full focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <Avatar name={fullName} url={user?.avatar} size="default" />
        </button>
      </DropdownTrigger>
      <DropdownContent align="start" sideOffset={8} className="min-w-[14rem]">
        {/* Identity header — name + username, non-interactive. */}
        <DropdownLabel className="tracking-normal normal-case">
          <div className="flex flex-col gap-0.5">
            <span className="text-text-primary text-sm font-semibold">
              {fullName ?? user?.username ?? sharedText.youFallback}
            </span>
            {user?.username && (
              <span className="text-text-secondary text-xs font-normal">
                @{user.username} · {presenceText[ownStatus]}
              </span>
            )}
          </div>
        </DropdownLabel>

        <DropdownSeparator />

        <DropdownLabel>{presenceText.statusHeading}</DropdownLabel>
        <DropdownItem onSelect={() => setManualPresence("online")}>
          <StatusDot status="online" />
          {presenceText.setOnline}
          {ownStatus === "online" && <ActiveCheck />}
        </DropdownItem>
        <DropdownItem onSelect={() => setManualPresence("away")}>
          <StatusDot status="away" />
          {presenceText.setAway}
          {ownStatus === "away" && <ActiveCheck />}
        </DropdownItem>

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
