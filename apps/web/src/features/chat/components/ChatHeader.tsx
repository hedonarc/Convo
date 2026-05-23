import { presenceText } from "@shared/constants/strings/index.en";
import type { User } from "@shared/types/user";
import { Avatar } from "@shared/ui";

import { usePresence } from "@/providers";

interface ChatHeaderProps {
  user: User | null;
  /** When true the chat is the "notes to self" conversation. */
  isSelfChat?: boolean;
}

export function ChatHeader({ user, isSelfChat }: ChatHeaderProps) {
  const fullName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
    user?.username;

  const displayName = isSelfChat ? `${fullName ?? "You"} (You)` : fullName;

  // Show the presence dot only for real peers — the notes-to-self view has
  // no one else to show a status for. Hook runs unconditionally so the
  // rules of hooks are preserved.
  const peerPresence = usePresence(user?.id);
  const presence = isSelfChat ? undefined : peerPresence;

  return (
    <header className="border-border bg-surface flex shrink-0 items-center gap-3 border-b px-4 py-3">
      <Avatar
        name={fullName}
        url={user?.avatar}
        size="default"
        presence={presence}
        presenceLabel={presence ? presenceText[presence] : undefined}
      />
      <div className="min-w-0">
        <p className="text-text-primary truncate text-sm font-semibold">
          {displayName ?? "Conversation"}
        </p>
        {user?.username && (
          <p className="text-text-secondary truncate text-xs">
            @{user.username}
          </p>
        )}
      </div>
    </header>
  );
}
