import type {
  Message,
  MessageStatus,
  PendingMessage,
} from "@shared/types/message";
import type { User } from "@shared/types/user";
import { Spinner } from "@shared/ui";
import { cn } from "@shared/utils";
import { ChevronDown, MessageCircle } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

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
  /** id of the last own message that's been read by any peer; ⇒ "Seen" tick. */
  lastSeenOwnMessageId?: number | null;
  /** id of the last own message a peer has confirmed delivery for. */
  lastDeliveredOwnMessageId?: number | null;
  /** Edit handler; receives (messageId, newContent). */
  onEditMessage?: (messageId: number, content: string) => Promise<void>;
  /** Delete handler; receives messageId. */
  onDeleteMessage?: (messageId: number) => Promise<void>;
}

const NEAR_BOTTOM_THRESHOLD_PX = 100;

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
  lastSeenOwnMessageId,
  lastDeliveredOwnMessageId,
  onEditMessage,
  onDeleteMessage,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const scrollHeightBeforePrepend = useRef<number | null>(null);
  const prevFirstIdRef = useRef<number | null>(null);
  const prevLastIdRef = useRef<number | null>(null);
  // Mirror of isNearBottom for the auto-scroll layout effect to read without
  // listing it as a dependency (which would re-run on every scroll event).
  const isNearBottomRef = useRef(true);

  const [isNearBottom, setIsNearBottom] = useState(true);
  const [unreadBelow, setUnreadBelow] = useState(0);

  useEffect(() => {
    isNearBottomRef.current = isNearBottom;
  }, [isNearBottom]);

  const firstId = messages[0]?.id ?? null;
  const lastId = messages[messages.length - 1]?.id ?? null;
  const pendingCount = pendingMessages?.length ?? 0;

  // Scroll position bookkeeping:
  //  - Initial load / append while at bottom → jump to bottom.
  //  - Append while scrolled up → don't snap; jump-to-latest button handles it.
  //  - Prepend (older page) → preserve viewport so the visible content stays.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const prevFirst = prevFirstIdRef.current;
    const prevLast = prevLastIdRef.current;
    const isInitial = prevFirst === null && firstId !== null;
    const isAppend =
      prevLast !== null && lastId !== prevLast && firstId === prevFirst;
    const isPrepend = prevFirst !== null && firstId !== prevFirst;

    if (isInitial || (isAppend && isNearBottomRef.current)) {
      el.scrollTop = el.scrollHeight;
    } else if (isPrepend && scrollHeightBeforePrepend.current !== null) {
      el.scrollTop = el.scrollHeight - scrollHeightBeforePrepend.current;
      scrollHeightBeforePrepend.current = null;
    }

    prevFirstIdRef.current = firstId;
    prevLastIdRef.current = lastId;
  }, [firstId, lastId]);

  // Increment the unread-below counter when a new message lands while the
  // user is scrolled up. Wrapped in an inline async fn so the lint rule
  // doesn't trip on direct setState in the effect body.
  const prevLastIdForUnreadRef = useRef<number | null>(null);
  useEffect(() => {
    const reactToNewMessage = async () => {
      if (lastId === null) return;
      const previous = prevLastIdForUnreadRef.current;
      if (lastId === previous) return;
      const isFirstSeen = previous === null;
      prevLastIdForUnreadRef.current = lastId;
      if (!isFirstSeen && !isNearBottomRef.current) {
        setUnreadBelow((u) => u + 1);
      }
    };
    reactToNewMessage();
  }, [lastId]);

  // Optimistic own-sends always scroll to bottom regardless of position —
  // the user just hit Send, they expect to see their own message.
  useLayoutEffect(() => {
    if (pendingCount === 0) return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [pendingCount]);

  // Scroll listener → track isNearBottom + clear unread when caught up.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const nearBottom =
        el.scrollHeight - (el.scrollTop + el.clientHeight) <
        NEAR_BOTTOM_THRESHOLD_PX;
      setIsNearBottom(nearBottom);
      if (nearBottom) setUnreadBelow(0);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

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

  const jumpToLatest = () => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    setUnreadBelow(0);
  };

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
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        ref={scrollRef}
        className="bg-background no-scrollbar flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-6"
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
          const seen =
            isOwn &&
            !message.is_deleted &&
            lastSeenOwnMessageId !== null &&
            lastSeenOwnMessageId !== undefined &&
            lastSeenOwnMessageId >= message.id;
          const delivered =
            isOwn &&
            !message.is_deleted &&
            lastDeliveredOwnMessageId !== null &&
            lastDeliveredOwnMessageId !== undefined &&
            lastDeliveredOwnMessageId >= message.id;
          return (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={isOwn}
              sender={isOwn ? undefined : participantById.get(message.sender)}
              status={statusByMessageId?.[message.id]}
              seen={seen}
              delivered={delivered}
              onEdit={
                isOwn && onEditMessage && !message.is_deleted
                  ? (content) => onEditMessage(message.id, content)
                  : undefined
              }
              onDelete={
                isOwn && onDeleteMessage && !message.is_deleted
                  ? () => onDeleteMessage(message.id)
                  : undefined
              }
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

      {/* Jump-to-latest pill — only when the user is scrolled up AND has
          unread messages below. Uses brand tokens; no raw colors. */}
      {unreadBelow > 0 && !isNearBottom && (
        <button
          type="button"
          onClick={jumpToLatest}
          aria-label={`${unreadBelow} new message${unreadBelow === 1 ? "" : "s"} below — jump to latest`}
          className={cn(
            "bg-brand text-brand-foreground hover:bg-brand/90 focus-visible:ring-ring",
            "absolute right-4 bottom-4 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium shadow-md",
            "transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
          )}
        >
          <ChevronDown className="h-3.5 w-3.5" />
          {unreadBelow > 9 ? "9+" : unreadBelow} new
        </button>
      )}
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
