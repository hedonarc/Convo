import { presenceText, sharedText } from "@shared/constants/strings/index.en";
import type { User } from "@shared/types/user";
import { Avatar } from "@shared/ui";
import { ChevronDown, MessageSquarePlus } from "lucide-react";

import { usePresence } from "@/providers";

import { UserMenu } from "./UserMenu";

interface ConversationListHeaderProps {
  user: User | null;
  fullName?: string;
  onNewChat: () => void;
}

/**
 * Sidebar header: the user's identity tile (avatar + name + @handle) on the
 * left, with a chevron that signals "click to open menu", and a new-chat
 * button on the right. The whole identity tile is the menu trigger; the
 * avatar inside it shows the user's own presence dot so status is visible
 * at all times without opening the menu.
 */
export function ConversationListHeader({
  user,
  fullName,
  onNewChat,
}: ConversationListHeaderProps) {
  const ownStatus = usePresence(user?.id);
  const displayName = fullName ?? user?.username ?? sharedText.youFallback;

  return (
    <div className="border-border flex items-center justify-between border-b px-3 py-3">
      <UserMenu userId={user?.id}>
        <button
          type="button"
          aria-label={sharedText.userMenuAriaLabel}
          className="hover:bg-brand/5 focus-visible:ring-ring -mx-1 flex min-w-0 flex-1 items-center gap-3 rounded-md px-2 py-1.5 text-left transition-colors focus-visible:ring-1 focus-visible:outline-none"
        >
          <Avatar
            name={fullName}
            url={user?.avatar}
            size="default"
            presence={ownStatus}
            presenceLabel={presenceText[ownStatus]}
          />
          <div className="min-w-0 flex-1">
            <p className="text-text-primary truncate text-sm font-semibold">
              {displayName}
            </p>
            {user?.username && (
              <p className="text-text-secondary truncate text-xs">
                @{user.username}
              </p>
            )}
          </div>
          <ChevronDown
            aria-hidden
            className="text-text-secondary h-4 w-4 shrink-0"
          />
        </button>
      </UserMenu>

      <button
        type="button"
        aria-label={sharedText.newConversationAriaLabel}
        onClick={onNewChat}
        className="text-text-secondary hover:text-brand hover:bg-brand/10 focus-visible:ring-ring ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors focus-visible:ring-1 focus-visible:outline-none"
      >
        <MessageSquarePlus className="h-4 w-4" />
      </button>
    </div>
  );
}
