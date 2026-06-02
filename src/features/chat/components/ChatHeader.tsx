import { ArrowLeft } from "lucide-react";
import { useState } from "react";

import { usePresence } from "@/providers";
import {
  dashboardText,
  presenceText,
  sharedText,
} from "@/shared/constants/strings/index.en";
import type { User } from "@/shared/types/user";
import { Avatar, AvatarZoomModal } from "@/shared/ui";

interface ChatHeaderProps {
  user: User | null;
  /** When true the chat is the "notes to self" conversation. */
  isSelfChat?: boolean;
  /** Mobile-only back affordance — returns to the conversation list. */
  onBack?: () => void;
}

export function ChatHeader({ user, isSelfChat, onBack }: ChatHeaderProps) {
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const fullName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
    user?.username;

  const displayName = isSelfChat
    ? `${fullName ?? sharedText.youFallback} ${dashboardText.meSuffix}`
    : fullName;

  // Show the presence dot only for real peers — the notes-to-self view has
  // no one else to show a status for. Hook runs unconditionally so the
  // rules of hooks are preserved.
  const peerPresence = usePresence(user?.id);
  const presence = isSelfChat ? undefined : peerPresence;

  const canZoom = !!user?.avatar;

  return (
    <header className="border-border bg-surface flex shrink-0 items-center gap-3 border-b px-4 py-3">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          aria-label={sharedText.backToConversations}
          className="text-text-secondary hover:text-text-primary hover:bg-brand/5 focus-visible:ring-ring -ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-md transition-colors focus-visible:ring-1 focus-visible:outline-none md:hidden"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      )}
      <button
        type="button"
        onClick={() => canZoom && setIsZoomOpen(true)}
        disabled={!canZoom}
        aria-label={sharedText.zoomAvatarAriaLabel}
        className="focus-visible:ring-ring shrink-0 rounded-full focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-default"
      >
        <Avatar
          name={fullName}
          url={user?.avatar}
          size="default"
          presence={presence}
          presenceLabel={presence ? presenceText[presence] : undefined}
        />
      </button>
      <div className="min-w-0">
        <p className="text-text-primary truncate text-sm font-semibold">
          {displayName ?? sharedText.conversationFallback}
        </p>
        {user?.username && (
          <p className="text-text-secondary truncate text-xs">
            @{user.username}
          </p>
        )}
      </div>

      <AvatarZoomModal
        open={isZoomOpen}
        onClose={() => setIsZoomOpen(false)}
        url={user?.avatar}
        name={fullName}
        ariaLabel={sharedText.avatarZoomDialogLabel}
      />
    </header>
  );
}
