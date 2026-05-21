import type { Message, MessageStatus } from "@shared/types/message";
import type { User } from "@shared/types/user";
import { Avatar } from "@shared/ui";
import { cn } from "@shared/utils";
import { AlertCircle, Check, Loader2 } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  /** Sender user; only used for received bubbles. */
  sender?: User;
  /** Client-side status for own messages — controls icon + dim. */
  status?: MessageStatus;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function MessageBubble({
  message,
  isOwn,
  sender,
  status,
}: MessageBubbleProps) {
  // Soft-deleted messages are returned with `is_deleted: true` and `content: ""`.
  // Render a muted placeholder regardless of who sent it.
  if (message.is_deleted) {
    return (
      <div
        className={cn(
          "flex items-end gap-2",
          isOwn ? "flex-row-reverse" : "flex-row",
        )}
      >
        {!isOwn && (
          <Avatar
            name={
              [sender?.first_name, sender?.last_name].filter(Boolean).join(" ") ||
              sender?.username
            }
            url={sender?.avatar}
            size="sm"
          />
        )}
        <p className="text-text-secondary text-sm italic">Message deleted</p>
      </div>
    );
  }

  const fullName =
    [sender?.first_name, sender?.last_name].filter(Boolean).join(" ") ||
    sender?.username;

  return (
    <div
      className={cn(
        "flex items-end gap-2",
        isOwn ? "flex-row-reverse" : "flex-row",
      )}
    >
      {!isOwn && (
        <Avatar name={fullName} url={sender?.avatar} size="sm" />
      )}

      <div
        className={cn(
          "flex max-w-[75%] flex-col gap-1",
          isOwn ? "items-end" : "items-start",
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2 text-sm break-words whitespace-pre-wrap",
            isOwn
              ? "bg-brand text-brand-foreground rounded-br-md"
              : "bg-surface border-border text-text-primary rounded-bl-md border",
            status === "sending" && "opacity-70",
          )}
        >
          {message.content}
        </div>

        <div
          className={cn(
            "text-text-secondary flex items-center gap-1 text-[10px]",
            isOwn ? "justify-end" : "justify-start",
          )}
        >
          <span>{formatTime(message.created_at)}</span>
          {isOwn && status === "sending" && (
            <Loader2 className="h-3 w-3 animate-spin" aria-label="Sending" />
          )}
          {isOwn && status === "sent" && (
            <Check className="h-3 w-3" aria-label="Sent" />
          )}
          {isOwn && status === "failed" && (
            <AlertCircle
              className="h-3 w-3 text-red-500"
              aria-label="Failed to send"
            />
          )}
          {message.edited_at && <span>(edited)</span>}
        </div>
      </div>
    </div>
  );
}
