import type { Conversation } from "@shared/types/conversation";
import { Avatar } from "@shared/ui";
import { cn } from "@shared/utils";
import { useAuth } from "../../../providers/auth.provider";

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
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function ConversationItem({
  conversation,
  isActive,
  onClick,
}: ConversationItemProps) {
  const { user } = useAuth();

  // Derive a display name: use conversation_key as a fallback label
  // (will be enhanced once the serializer exposes participant user data)
  const displayName = conversation.conversation_key
    ? conversation.conversation_key.replace(/_/g, " ").trim()
    : `Conversation #${conversation.id}`;

  const lastMessageText = conversation.invitation && !conversation.invitation.is_accepted && conversation.invitation?.email
    ? `Waiting for ${conversation.invitation.email}`
    : conversation.last_message
    ? conversation.last_message.is_deleted
      ? "Message deleted"
      : conversation.last_message.content
    : "No messages yet";

  const isMine =
    conversation.last_message?.sender === user?.id;

  return (
    <button
      type="button"
      id={`conversation-item-${conversation.id}`}
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        isActive
          ? "bg-brand/10 border-r-2 border-brand"
          : "hover:bg-brand/5 border-r-2 border-transparent",
      )}
    >
      <Avatar name={displayName} size="default" />

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">
              {displayName}
            </p>
            {conversation.invitation && !conversation.invitation?.is_accepted && (
              <span className="inline-flex items-center rounded-full bg-brand/10 px-1.5 py-0.5 text-[10px] font-medium text-brand ring-1 ring-inset ring-brand/20">
                Pending
              </span>
            )}
          </div>
          {conversation.last_message && (
            <span className="text-xs text-text-secondary shrink-0">
              {formatRelativeTime(conversation.updated_at)}
            </span>)}
        </div>
        <p className="text-xs text-text-secondary truncate mt-0.5">
          {isMine ? `You: ${lastMessageText}` : lastMessageText}
        </p>
      </div>
    </button>
  );
}
