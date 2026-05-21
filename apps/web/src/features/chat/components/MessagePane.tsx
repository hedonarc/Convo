import type { Conversation } from "@shared/types/conversation";
import { Button, ErrorBanner } from "@shared/ui";
import { cn } from "@shared/utils";

import { useAuth } from "@/providers";

import { useConversationSocket } from "../hooks/useConversationSocket";
import { useMessages } from "../hooks/useMessages";
import { ChatHeader } from "./ChatHeader";
import { ConnectionStatus } from "./ConnectionStatus";
import { MessageInput } from "./MessageInput";
import { MessageList } from "./MessageList";

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
    pendingMessages,
    addPending,
    reconcilePending,
  } = useMessages(conversation.id);

  const { status, send } = useConversationSocket(conversation.id, (event) => {
    if (event.type !== "new_message") return;

    // If this is the echo of our own send, drop the matching optimistic entry
    // before appending the server-canonical version.
    if (user && event.data.sender === user.id) {
      reconcilePending(event.data.content);
    }
    appendIncoming(event.data);
  });

  if (!user) return null;

  const participants = conversation.participants ?? [];
  const otherUser =
    participants.find((p) => p.id !== user.id) ?? participants[0] ?? null;
  const isSelfChat = participants.length === 1 && participants[0]?.id === user.id;

  const emptyStateName =
    [otherUser?.first_name, otherUser?.last_name].filter(Boolean).join(" ") ||
    otherUser?.username;

  // The sidebar already knows whether the conversation has any messages — if
  // `last_message` is null we can skip the loading skeleton entirely and go
  // straight to the empty state, avoiding a 5-fake-bubble flash for chats
  // that haven't started yet.
  const knownEmpty = !conversation.last_message;

  const handleSend = (content: string) => {
    addPending(content);
    send("send_message", { content });
  };

  return (
    <section className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
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
          />
        )}

        <ConnectionStatus status={status} />
      </div>

      <MessageInput onSend={handleSend} disabled={status !== "open"} />
    </section>
  );
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
