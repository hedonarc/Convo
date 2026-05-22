import type {
  Message,
  MessageStatus,
  PendingMessage,
} from "@shared/types/message";
import type { User } from "@shared/types/user";
import { Spinner } from "@shared/ui";
import { MessageCircle } from "lucide-react";
import { useEffect, useLayoutEffect, useRef } from "react";

import { MessageBubble } from "./MessageBubble";

interface MessageListProps {
  messages: Message[];
  currentUserId: number;
  participants: User[];
  statusByMessageId?: Record<number, MessageStatus>;
  /** Outgoing optimistic messages rendered after committed ones. */
  pendingMessages?: PendingMessage[];
  emptyStateName?: string;
  isSelfChat?: boolean;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadOlder?: () => void;
}

export function MessageList({
  messages,
  currentUserId,
  participants,
  statusByMessageId,
  pendingMessages,
  emptyStateName,
  isSelfChat,
  hasMore = false,
  isLoadingMore = false,
  onLoadOlder,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const scrollHeightBeforePrepend = useRef<number | null>(null);
  const prevFirstIdRef = useRef<number | null>(null);
  const prevLastIdRef = useRef<number | null>(null);

  const firstId = messages[0]?.id ?? null;
  const lastId = messages[messages.length - 1]?.id ?? null;
  const pendingCount = pendingMessages?.length ?? 0;

  // Scroll behaviour for the committed list: jump to bottom on first load /
  // new bottom message; preserve viewport position when an older page is
  // prepended.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const prevFirst = prevFirstIdRef.current;
    const prevLast = prevLastIdRef.current;
    const isInitial = prevFirst === null && firstId !== null;
    const isAppend =
      prevLast !== null && lastId !== prevLast && firstId === prevFirst;
    const isPrepend = prevFirst !== null && firstId !== prevFirst;

    if (isInitial || isAppend) {
      el.scrollTop = el.scrollHeight;
    } else if (isPrepend && scrollHeightBeforePrepend.current !== null) {
      el.scrollTop = el.scrollHeight - scrollHeightBeforePrepend.current;
      scrollHeightBeforePrepend.current = null;
    }

    prevFirstIdRef.current = firstId;
    prevLastIdRef.current = lastId;
  }, [firstId, lastId]);

  // Scroll to bottom whenever a new optimistic message is added so the user
  // sees their own bubble immediately.
  useLayoutEffect(() => {
    if (pendingCount === 0) return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [pendingCount]);

  // Trigger loadOlder when the top sentinel enters the viewport.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    const scrollEl = scrollRef.current;
    if (!sentinel || !scrollEl || !hasMore || isLoadingMore || !onLoadOlder) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          scrollHeightBeforePrepend.current = scrollEl.scrollHeight;
          onLoadOlder();
        }
      },
      { root: scrollEl, threshold: 0.5 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, onLoadOlder]);

  const participantById = new Map(participants.map((p) => [p.id, p]));

  // Empty state — only when there are no committed AND no pending bubbles.
  if (messages.length === 0 && pendingCount === 0) {
    return (
      <div className="bg-background flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="bg-brand/10 mb-3 flex h-16 w-16 items-center justify-center rounded-full">
          <MessageCircle className="text-brand h-8 w-8" />
        </div>
        <h3 className="text-text-primary mb-1 text-base font-semibold">
          {isSelfChat ? "Notes to self" : "Say hi 👋"}
        </h3>
        <p className="text-text-secondary max-w-xs text-sm">
          {isSelfChat
            ? "Save thoughts, links, and reminders just for you."
            : `This is the start of your conversation${
                emptyStateName ? ` with ${emptyStateName}` : ""
              }.`}
        </p>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="bg-background flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-6"
    >
      {hasMore ? (
        <div
          ref={sentinelRef}
          className="flex items-center justify-center py-2"
        >
          {isLoadingMore && <Spinner size="sm" />}
        </div>
      ) : (
        messages.length > 0 && (
          <p className="text-text-secondary py-2 text-center text-xs">
            Beginning of conversation
          </p>
        )
      )}

      {messages.map((message) => {
        const isOwn = message.sender === currentUserId;
        return (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={isOwn}
            sender={isOwn ? undefined : participantById.get(message.sender)}
            status={statusByMessageId?.[message.id]}
          />
        );
      })}

      {pendingMessages?.map((p) => (
        <MessageBubble
          key={`pending-${p.clientId}`}
          message={pendingToMessage(p, currentUserId)}
          isOwn
          status={p.status}
        />
      ))}
    </div>
  );
}

function pendingToMessage(p: PendingMessage, senderId: number): Message {
  return {
    id: 0,
    conversation: 0,
    sender: senderId,
    content: p.content,
    prev_content: null,
    is_deleted: false,
    created_at: p.createdAt,
    updated_at: p.createdAt,
    edited_at: null,
    deleted_at: null,
  };
}
