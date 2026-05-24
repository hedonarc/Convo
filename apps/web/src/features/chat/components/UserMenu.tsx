import { ROUTES } from "@shared/constants";
import { presenceText, sharedText } from "@shared/constants/strings/index.en";
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
import { LogOut, Moon, Sun, User as UserIcon } from "lucide-react";
import { useNavigate } from "react-router";

import { useAuth, usePresence, useTheme } from "@/providers";

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
  const navigate = useNavigate();

  // Own status — only used to label the menu header. We still don't render
  // a presence dot on the user's own avatar in the sidebar, but knowing the
  // status here makes the upcoming manual-override section feel grounded.
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
