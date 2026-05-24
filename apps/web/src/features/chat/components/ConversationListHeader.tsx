import { dashboardText, sharedText } from "@shared/constants/strings/index.en";
import type { User } from "@shared/types/user";
import { MessageSquarePlus } from "lucide-react";

import { UserMenu } from "./UserMenu";

interface ConversationListHeaderProps {
  user: User | null;
  fullName?: string;
  onNewChat: () => void;
}

/**
 * Sidebar header: avatar (opens the account menu), user name/handle, and the
 * "new conversation" button. Avatar editing now lives on the /profile page,
 * so this surface is purely identity + navigation.
 */
export function ConversationListHeader({
  user,
  fullName,
  onNewChat,
}: ConversationListHeaderProps) {
  return (
    <div className="border-border flex items-center justify-between border-b px-4 py-4">
      <div className="flex min-w-0 items-center gap-3">
        <UserMenu user={user} fullName={fullName} />

        <div className="min-w-0">
          <h2 className="text-text-primary text-base font-semibold">
            {dashboardText.messagesHeading}
          </h2>
          {user && (
            <p className="text-text-secondary mt-0.5 truncate text-xs">
              @{user.username}
            </p>
          )}
        </div>
      </div>

      <button
        type="button"
        aria-label={sharedText.newConversationAriaLabel}
        onClick={onNewChat}
        className="text-text-secondary hover:text-brand hover:bg-brand/10 focus-visible:ring-ring flex h-8 w-8 items-center justify-center rounded-lg transition-colors focus-visible:ring-1 focus-visible:outline-none"
      >
        <MessageSquarePlus className="h-4 w-4" />
      </button>
    </div>
  );
}
