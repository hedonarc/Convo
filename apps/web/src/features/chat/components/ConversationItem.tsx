import type { Conversation, Participant } from "@shared/types/conversation";
import { Avatar } from "@shared/ui";
import { cn } from "@shared/utils";

import { useAuth } from "@/providers";

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function ConversationItem({
  conversation,
  isActive,
  onClick,
}: ConversationItemProps) {
  const { user } = useAuth();
  const isMe = conversation.participants?.length === 1;
  const displayUser = isMe
    ? user
    : conversation.participants?.find((p: Participant) => p.id !== user?.id);

  const displayName = displayUser?.first_name + " " + displayUser?.last_name;

  const invitation = conversation.invitation;

  const isPendingInvitation = !!invitation && !invitation.is_accepted;

  const lastMessageText = (() => {
    if (isPendingInvitation && invitation?.email) {
      return `Waiting for ${invitation.email}`;
    }

    const lastMessage = conversation.last_message;

    if (!lastMessage) return "No messages yet";

    if (lastMessage.is_deleted) return "Message deleted";

    return lastMessage.content;
  })();

  const isCurrentUserSender = conversation.last_message?.sender === user?.id;

  return (
    <button
      type="button"
      id={`conversation-item-${conversation.id}`}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
        "focus-visible:ring-ring focus-visible:ring-1 focus-visible:outline-none",
        isActive
          ? "bg-brand/10 border-brand border-r-2"
          : "hover:bg-brand/5 border-r-2 border-transparent",
      )}
    >
      <Avatar name={displayName} url={displayUser?.avatar} size="default" />

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <p className="text-text-primary truncate text-sm font-semibold">
              {isMe ? displayName + " (Me)" : displayName}
            </p>
            {isPendingInvitation && (
              <span className="bg-brand/10 text-brand ring-brand/20 inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset">
                Pending
              </span>
            )}
          </div>
          {conversation.last_message && (
            <span className="text-text-secondary shrink-0 text-xs">
              {formatRelativeTime(conversation.updated_at)}
            </span>
          )}
        </div>
        <p className="text-text-secondary mt-0.5 truncate text-xs">
          {isCurrentUserSender ? `You: ${lastMessageText}` : lastMessageText}
        </p>
      </div>
    </button>
  );
}
