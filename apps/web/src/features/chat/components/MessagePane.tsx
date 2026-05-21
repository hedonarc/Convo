import type { Conversation } from "@shared/types/conversation";
import { Button, ErrorBanner } from "@shared/ui";
import { cn } from "@shared/utils";

import { useAuth } from "@/providers";

import { useMessages } from "../hooks/useMessages";
import { ChatHeader } from "./ChatHeader";
import { MessageInput } from "./MessageInput";
import { MessageList } from "./MessageList";

interface MessagePaneProps {
  conversation: Conversation;
}

export function MessagePane({ conversation }: MessagePaneProps) {
  const { user } = useAuth();
  const { messages, isLoading, isLoadingMore, error, hasMore, loadOlder, retry } =
    useMessages(conversation.id);

  if (!user) return null;

  const participants = conversation.participants ?? [];
  const otherUser =
    participants.find((p) => p.id !== user.id) ?? participants[0] ?? null;
  const isSelfChat = participants.length === 1 && participants[0]?.id === user.id;

  const emptyStateName =
    [otherUser?.first_name, otherUser?.last_name].filter(Boolean).join(" ") ||
    otherUser?.username;

  // TODO Phase 3: wire to ConversationSocket.send({ action: "send_message", ... })
  const handleSend = () => {
    // stub — see TODO above
  };

  return (
    <section className="flex h-full min-w-0 flex-1 flex-col">
      <ChatHeader user={otherUser} isSelfChat={isSelfChat} />

      {isLoading ? (
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
          emptyStateName={emptyStateName}
          isSelfChat={isSelfChat}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
          onLoadOlder={loadOlder}
        />
      )}

      <MessageInput onSend={handleSend} />
    </section>
  );
}

function MessageListSkeleton() {
  // 5 message-shaped placeholders, alternating sides, varying widths.
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
