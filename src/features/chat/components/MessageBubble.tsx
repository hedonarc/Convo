import {
  AlertCircle,
  Check,
  CheckCheck,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { MAX_MESSAGE_LENGTH } from "@/shared/constants";
import { dashboardText, sharedText } from "@/shared/constants/strings/index.en";
import type { Message, MessageStatus } from "@/shared/types/message";
import type { User } from "@/shared/types/user";
import { Avatar, Button } from "@/shared/ui";
import { cn } from "@/shared/utils";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  /** Sender user; only used for received bubbles. */
  sender?: User;
  /** Client-side status for own messages — controls icon + dim. */
  status?: MessageStatus;
  /** When true, render the double-tick "Seen" indicator. */
  seen?: boolean;
  /** When true (and not seen), render the gray double-tick "Delivered" tick. */
  delivered?: boolean;
  /** Hover-revealed edit/delete affordances for own messages. */
  onEdit?: (content: string) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
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
  seen,
  delivered,
  onEdit,
  onDelete,
}: MessageBubbleProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.content);
  const [working, setWorking] = useState(false);
  const editRef = useRef<HTMLTextAreaElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // When entering edit mode:
  //  - place the caret at the end of the existing content (right-most), and
  //  - scroll the bubble into view so the expanded edit form isn't clipped
  //    below the viewport for the bottom-most message.
  useEffect(() => {
    if (!editing) return;
    const ta = editRef.current;
    if (ta) {
      ta.focus();
      const end = ta.value.length;
      ta.setSelectionRange(end, end);
    }
    wrapperRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [editing]);

  // Soft-deleted messages are returned with `is_deleted: true` and `content: ""`.
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
              [sender?.first_name, sender?.last_name]
                .filter(Boolean)
                .join(" ") || sender?.username
            }
            url={sender?.avatar}
            size="sm"
          />
        )}
        <p className="text-text-secondary text-sm italic">
          {dashboardText.messageDeleted}
        </p>
      </div>
    );
  }

  const fullName =
    [sender?.first_name, sender?.last_name].filter(Boolean).join(" ") ||
    sender?.username;

  const trimmedDraft = draft.trim();
  const draftTooLong = trimmedDraft.length > MAX_MESSAGE_LENGTH;
  const canSaveEdit =
    !!onEdit &&
    trimmedDraft.length > 0 &&
    !draftTooLong &&
    trimmedDraft !== message.content &&
    !working;

  const commitEdit = async () => {
    if (!canSaveEdit || !onEdit) return;
    setWorking(true);
    try {
      await onEdit(trimmedDraft);
      setEditing(false);
    } catch {
      // Parent surfaces errors; just stay in edit mode.
    } finally {
      setWorking(false);
    }
  };

  const cancelEdit = () => {
    setDraft(message.content);
    setEditing(false);
  };

  const handleDelete = async () => {
    if (!onDelete || working) return;
    if (!window.confirm(sharedText.deleteMessagePrompt)) return;
    setWorking(true);
    try {
      await onDelete();
    } finally {
      setWorking(false);
    }
  };

  return (
    <div
      ref={wrapperRef}
      className={cn(
        "group/bubble flex items-end gap-2",
        isOwn ? "flex-row-reverse" : "flex-row",
      )}
    >
      {!isOwn && <Avatar name={fullName} url={sender?.avatar} size="sm" />}

      <div
        className={cn(
          "flex max-w-[75%] flex-col gap-1",
          isOwn ? "items-end" : "items-start",
        )}
      >
        <div className="flex items-center gap-1">
          {/* Own-bubble action buttons appear on hover. */}
          {isOwn && !editing && (onEdit || onDelete) && (
            <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover/bubble:opacity-100">
              {onEdit && (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  aria-label={sharedText.editMessageAriaLabel}
                  className="text-text-secondary hover:text-text-primary hover:bg-brand/5 focus-visible:ring-ring rounded-md p-1 focus-visible:ring-1 focus-visible:outline-none"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  aria-label={sharedText.deleteMessageAriaLabel}
                  className="text-text-secondary rounded-md p-1 hover:bg-red-50 hover:text-red-500 focus-visible:ring-1 focus-visible:ring-red-500 focus-visible:outline-none dark:hover:bg-red-900/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}

          {editing ? (
            <div
              className={cn(
                "flex w-full flex-col gap-2 rounded-2xl border p-2",
                "border-border bg-surface",
              )}
            >
              <textarea
                ref={editRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    commitEdit();
                  }
                  if (e.key === "Escape") cancelEdit();
                }}
                aria-label={sharedText.editMessageAriaLabel}
                aria-invalid={draftTooLong || undefined}
                className={cn(
                  "text-text-primary placeholder:text-text-secondary focus-visible:ring-ring min-h-[2.25rem] w-full resize-none rounded-md bg-transparent px-2 py-1 text-sm focus-visible:ring-1 focus-visible:outline-none",
                  draftTooLong && "text-red-500",
                )}
              />
              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={cancelEdit}
                  disabled={working}
                >
                  {sharedText.cancel}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={commitEdit}
                  disabled={!canSaveEdit}
                >
                  {sharedText.save}
                </Button>
              </div>
            </div>
          ) : (
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
          )}
        </div>

        <div
          className={cn(
            "text-text-secondary flex items-center gap-1 text-[10px]",
            isOwn ? "justify-end" : "justify-start",
          )}
        >
          <span>{formatTime(message.created_at)}</span>
          {isOwn && status === "sending" && (
            <Loader2
              className="h-3 w-3 animate-spin"
              aria-label={sharedText.sendingAriaLabel}
            />
          )}
          {isOwn && status === "failed" && (
            <AlertCircle
              className="h-3 w-3 text-red-500"
              aria-label={sharedText.failedToSendAriaLabel}
            />
          )}
          {/*
            Tick ladder for own messages (most-specific wins):
              seen → double brand-coloured tick
              delivered (and not seen) → double gray tick
              sent (and not delivered) → single gray tick
            "sending" / "failed" are handled separately above.
          */}
          {isOwn && status !== "sending" && status !== "failed" && (
            <>
              {seen ? (
                <CheckCheck
                  className="text-brand h-3 w-3"
                  aria-label={sharedText.seenAriaLabel}
                />
              ) : delivered ? (
                <CheckCheck
                  className="h-3 w-3"
                  aria-label={sharedText.deliveredAriaLabel}
                />
              ) : (
                <Check
                  className="h-3 w-3"
                  aria-label={sharedText.sentAriaLabel}
                />
              )}
            </>
          )}
          {message.edited_at && <span>{sharedText.editedSuffix}</span>}
        </div>
      </div>
    </div>
  );
}
