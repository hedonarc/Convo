import { messagesApi } from "@shared/api";
import type { Conversation } from "@shared/types/conversation";
import { Button, ErrorBanner } from "@shared/ui";
import { cn } from "@shared/utils";
import { useEffect } from "react";

import { useAuth } from "@/providers";

import { useConversationSocket } from "../hooks/useConversationSocket";
import { useMessages } from "../hooks/useMessages";
import { useTypingIndicator } from "../hooks/useTypingIndicator";
import { ChatHeader } from "./ChatHeader";
import { ConnectionStatus } from "./ConnectionStatus";
import { MessageInput } from "./MessageInput";
import { MessageList } from "./MessageList";
import { TypingIndicator } from "./TypingIndicator";

interface MessagePaneProps {
  conversation: Conversation;
}

export function MessagePane({ conversation }: MessagePaneProps) {
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
      }
      appendIncoming(event.data);
      // Auto-read of peer messages is handled by the effect on
      // `latestPeerMessageId` below — it fires whenever a peer message
      // becomes the most recent in the visible list.
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

  // Mark the latest peer message as read when the conversation opens / loads.
  const latestPeerMessageId = (() => {
    if (!user) return null;
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (!m.is_deleted && m.sender !== user.id) return m.id;
    }
    return null;
  })();
  useEffect(() => {
    if (latestPeerMessageId === null || status !== "open") return;
    send("read", { message_id: latestPeerMessageId });
  }, [latestPeerMessageId, status, send]);

  if (!user) return null;

  const participants = conversation.participants ?? [];
  const otherUser =
    participants.find((p) => p.id !== user.id) ?? participants[0] ?? null;
  const isSelfChat =
    participants.length === 1 && participants[0]?.id === user.id;

  const emptyStateName =
    [otherUser?.first_name, otherUser?.last_name].filter(Boolean).join(" ") ||
    otherUser?.username;

  // The sidebar already knows whether the conversation has any messages — if
  // `last_message` is null we can skip the loading skeleton entirely and go
  // straight to the empty state.
  const knownEmpty = !conversation.last_message;

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

  return (
    <section className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <ChatHeader user={otherUser} isSelfChat={isSelfChat} />

      <div className="relative flex min-h-0 flex-1 flex-col">
        {isLoading && !knownEmpty ? (
          <MessageListSkeleton />
        ) : error ? (
          <div className="bg-background flex flex-1 flex-col items-center justify-center gap-3 px-6">
            <ErrorBanner message={error} className="max-w-md" />
            <Button variant="outline" size="sm" onClick={retry}>
              Try again
            </Button>
          </div>
        ) : (
          <MessageList
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
