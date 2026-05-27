import { messagesApi } from "@shared/api";
import type { Conversation } from "@shared/types/conversation";
import { Button, ErrorBanner } from "@shared/ui";
import { cn } from "@shared/utils";
import { useEffect, useState } from "react";

import { useAuth } from "@/providers";

import { useConversationSocket } from "../hooks/useConversationSocket";
import { useMessages } from "../hooks/useMessages";
import { useTypingIndicator } from "../hooks/useTypingIndicator";
import { ChatHeader } from "./ChatHeader";
import { ConnectionStatus } from "./ConnectionStatus";
import { MessageInput } from "./MessageInput";
import { MessageList } from "./MessageList";
import { TypingIndicator } from "./TypingIndicator";

// Wait this long before showing the loading skeleton. Cached / fast loads
// (the common case) resolve well within this window and never trigger the
// skeleton at all — eliminates the "flash of skeleton" jolt that used to
// happen on every conversation switch.
const SKELETON_DELAY_MS = 150;

interface MessagePaneProps {
  conversation: Conversation;
  /** Mobile-only back affordance — returns to the conversation list. */
  onBack?: () => void;
}

export function MessagePane({ conversation, onBack }: MessagePaneProps) {
  const { user } = useAuth();
  const {
    messages,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadOlder,
    retry,
    appendIncoming,
    applyMessageUpdate,
    pendingMessages,
    addPending,
    reconcilePending,
  } = useMessages(conversation.id);

  // Per-user read + delivery pointers, derived directly from the conversation
  // snapshot. The user-channel `conversation_updated` fan-out (wired in
  // Chat.tsx via `applyUpdate`) keeps these fresh whenever any peer marks a
  // message as read or delivered, so no local state mirror is needed.
  const readPointers = buildPointers(conversation.read_receipts);
  const deliveryPointers = buildPointers(conversation.delivery_receipts);

  const typing = useTypingIndicator();

  const { status, send } = useConversationSocket(conversation.id, (event) => {
    if (event.type === "new_message") {
      if (user && event.data.sender === user.id) {
        reconcilePending(event.data.content);
      } else {
        // Safety net: a peer's new message implies they pressed Send. Clear
        // their typing dot locally in case the explicit `is_typing: false`
        // frame races with the message (or never arrives — disconnect).
        typing.clearTyping(event.data.sender);
      }
      appendIncoming(event.data);
      // Read receipts are driven by the IntersectionObserver inside
      // MessageList — only bubbles that actually enter the viewport get
      // marked as read. No-op here.
      return;
    }
    if (event.type === "message_edited" || event.type === "message_deleted") {
      applyMessageUpdate(event.data);
      return;
    }
    if (event.type === "typing") {
      typing.applyTypingEvent(event.data.user_id, event.data.is_typing);
      return;
    }
    // event.type === "read_receipt" / "delivered_receipt" — the user-channel
    // `conversation_updated` fan-out already keeps read/delivery_receipts
    // fresh, no-op here.
    // event.type === "error" — surfaced server-side; ignored client-side.
  });

  // The sidebar already knows whether the conversation has any messages — if
  // `last_message` is null we can skip the loading skeleton entirely and go
  // straight to the empty state.
  const knownEmpty = !conversation.last_message;

  // ── Skeleton debounce ────────────────────────────────────────────────────
  // Hold off on the skeleton until a load has been pending long enough that
  // we *know* it's not just a fast cache hit. Saves the user a 50–150ms
  // flash of grey rectangles on every conversation switch.
  //
  // Implementation note: `setShowSkeleton(false)` is driven by a render-time
  // comparison rather than from inside the effect, per React's
  // "store-previous-value" recipe — keeps `react-hooks/set-state-in-effect`
  // happy and avoids the cascading-render pattern.
  const wantsSkeleton = isLoading && !knownEmpty;
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [trackedWantsSkeleton, setTrackedWantsSkeleton] =
    useState(wantsSkeleton);
  if (trackedWantsSkeleton !== wantsSkeleton) {
    setTrackedWantsSkeleton(wantsSkeleton);
    if (!wantsSkeleton) setShowSkeleton(false);
  }
  useEffect(() => {
    if (!wantsSkeleton) return;
    const timer = setTimeout(() => setShowSkeleton(true), SKELETON_DELAY_MS);
    return () => clearTimeout(timer);
  }, [wantsSkeleton]);

  if (!user) return null;

  const participants = conversation.participants ?? [];
  const otherUser =
    participants.find((p) => p.id !== user.id) ?? participants[0] ?? null;
  const isSelfChat =
    participants.length === 1 && participants[0]?.id === user.id;

  const emptyStateName =
    [otherUser?.first_name, otherUser?.last_name].filter(Boolean).join(" ") ||
    otherUser?.username;

  // Highest own message id that's been read by any peer → "Seen" tick anchor.
  const lastSeenOwnMessageId = (() => {
    if (isSelfChat) return null;
    let highest: number | null = null;
    for (const [userId, pointer] of readPointers) {
      if (userId === user.id) continue;
      if (highest === null || pointer > highest) highest = pointer;
    }
    return highest;
  })();

  // Highest own message id that's been delivered to any peer → double-gray
  // tick anchor. Always ≥ lastSeenOwnMessageId for the same peer.
  const lastDeliveredOwnMessageId = (() => {
    if (isSelfChat) return null;
    let highest: number | null = null;
    for (const [userId, pointer] of deliveryPointers) {
      if (userId === user.id) continue;
      if (highest === null || pointer > highest) highest = pointer;
    }
    return highest;
  })();

  const handleSend = (content: string) => {
    addPending(content);
    send("send_message", { content });
    // Cancel the deferred stop-timer and tell peers we've stopped typing
    // right now — otherwise they'd keep seeing the "is typing…" dot until
    // the 3s throttle window expires.
    typing.notifyStopped(send);
  };

  const handleEdit = async (messageId: number, content: string) => {
    const updated = await messagesApi.edit(conversation.id, messageId, content);
    applyMessageUpdate(updated);
  };

  const handleDelete = async (messageId: number) => {
    await messagesApi.remove(conversation.id, messageId);
    // Mirror the server's soft-delete locally; the WS event will arrive but
    // applying it twice is a no-op (replace by id with same payload shape).
    const target = messages.find((m) => m.id === messageId);
    if (target) {
      applyMessageUpdate({
        ...target,
        is_deleted: true,
        content: "",
        deleted_at: new Date().toISOString(),
      });
    }
  };

  // Filter our own user id from typing pings — the consumer already skips
  // echoing them to us, but defensive in case backend semantics drift.
  const peerTypingUserIds = typing.typingUserIds.filter((id) => id !== user.id);

  // While in the pre-skeleton debounce window (load is in flight but we
  // haven't committed to showing the skeleton yet), render nothing in the
  // content slot. The fade-in covers this so the user just sees the chrome
  // populated + a brief moment of empty space, not an empty-state flash.
  const inPreSkeletonWindow = wantsSkeleton && !showSkeleton;

  return (
    <section className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      {/* Chrome — renders unconditionally so the header populates the
          instant the conversation prop changes, no waiting on the fetch. */}
      <ChatHeader user={otherUser} isSelfChat={isSelfChat} onBack={onBack} />

      <div className="relative flex min-h-0 flex-1 flex-col">
        {showSkeleton ? (
          <MessageListSkeleton />
        ) : inPreSkeletonWindow ? null : error ? (
          <div className="bg-background flex flex-1 flex-col items-center justify-center gap-3 px-6">
            <ErrorBanner message={error} className="max-w-md" />
            <Button variant="outline" size="sm" onClick={retry}>
              Try again
            </Button>
          </div>
        ) : (
          // Keyed by conversation id so MessageList remounts on switch and
          // its initial-mount scroll-to-bottom logic re-runs — otherwise
          // the container holds the previous conversation's scrollTop
          // (often somewhere mid-history) when the new messages render.
          // MessagePane itself stays mounted; only the scroll container
          // resets.
          <MessageList
            key={conversation.id}
            messages={messages}
            currentUserId={user.id}
            participants={participants}
            pendingMessages={pendingMessages}
            emptyStateName={emptyStateName}
            isSelfChat={isSelfChat}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
            onLoadOlder={loadOlder}
            lastSeenOwnMessageId={lastSeenOwnMessageId}
            lastDeliveredOwnMessageId={lastDeliveredOwnMessageId}
            onEditMessage={handleEdit}
            onDeleteMessage={handleDelete}
            onMarkAsRead={(messageId) => {
              if (status !== "open") return;
              send("read", { message_id: messageId });
            }}
          />
        )}

        <ConnectionStatus status={status} />
      </div>

      <TypingIndicator
        typingUserIds={peerTypingUserIds}
        participants={participants}
      />
      <MessageInput
        onSend={handleSend}
        disabled={status !== "open"}
        onTyping={() => typing.notifyTyping(send)}
      />
    </section>
  );
}

function buildPointers(
  raw: Record<string, number | null> | undefined,
): Map<number, number> {
  const map = new Map<number, number>();
  if (!raw) return map;
  for (const [userIdStr, pointer] of Object.entries(raw)) {
    if (pointer !== null && pointer !== undefined) {
      map.set(Number(userIdStr), pointer);
    }
  }
  return map;
}

function MessageListSkeleton() {
  const rows = [0, 1, 2, 3, 4];
  return (
    <div className="bg-background flex flex-1 animate-pulse flex-col gap-3 px-4 py-6">
      {rows.map((i) => {
        const isOwn = i % 2 === 1;
        return (
          <div
            key={i}
            className={cn(
              "flex items-end gap-2",
              isOwn ? "flex-row-reverse" : "flex-row",
            )}
          >
            {!isOwn && <div className="bg-border h-7 w-7 rounded-full" />}
            <div
              className="bg-border h-9 rounded-2xl"
              style={{ width: `${40 + ((i * 13) % 30)}%` }}
            />
          </div>
        );
      })}
    </div>
  );
}
