import type { Conversation } from "@shared/types/conversation";
import { Spinner } from "@shared/ui";
import { AlertCircle } from "lucide-react";
import { useState } from "react";

import { ConversationList } from "../features/chat/components/ConversationList";
import { EmptyState } from "../features/chat/components/EmptyState";
import { MessagePane } from "../features/chat/components/MessagePane";
import { PendingInvitePanel } from "../features/chat/components/PendingInvitePanel";
import { useConversations } from "../features/chat/hooks/useConversations";

export default function Chat() {
  const { conversations, isLoading, error, refetch } = useConversations();
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);

  const handleCreated = async (conversation: Conversation) => {
    await refetch();
    setActiveConversation(conversation);
  };

  // ── Loading ─────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="center h-screen flex-col gap-4 px-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/10">
          <AlertCircle className="h-7 w-7 text-red-500" />
        </div>
        <p className="text-text-primary text-center font-medium">{error}</p>
        <button
          type="button"
          onClick={refetch}
          className="text-brand hover:text-brand/80 text-sm underline-offset-4 transition-colors hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  // ── Empty state ──────────────────────────────────────────────────────────
  if (conversations.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <EmptyState onConversationCreated={handleCreated} />
      </div>
    );
  }

  const isPendingInvite =
    activeConversation?.invitation &&
    !activeConversation.invitation.is_accepted;

  // ── Has conversations ────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden">
      <ConversationList
        conversations={conversations}
        activeId={activeConversation?.id ?? null}
        onSelect={setActiveConversation}
        onConversationCreated={handleCreated}
      />

      <main className="flex min-w-0 flex-1 flex-col">
        {activeConversation ? (
          isPendingInvite ? (
            <div className="center flex-1 px-6">
              <PendingInvitePanel
                key={activeConversation.id}
                conversation={activeConversation}
              />
            </div>
          ) : (
            <MessagePane
              key={activeConversation.id}
              conversation={activeConversation}
            />
          )
        ) : (
          <div className="text-text-secondary center flex-1 flex-col gap-3">
            <p className="text-sm font-medium">Select a conversation</p>
            <p className="text-xs">
              Choose from the list on the left to start messaging
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
