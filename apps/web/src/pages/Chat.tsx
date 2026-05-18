import type { Conversation } from "@shared/types/conversation";
import { Spinner } from "@shared/ui";
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { ConversationList } from "../features/chat/components/ConversationList";
import { EmptyState } from "../features/chat/components/EmptyState";
import { useConversations } from "../features/chat/hooks/useConversations";

export default function Chat() {
  const { conversations, isLoading, error, refetch } = useConversations();
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);

  // ── Loading ─────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background px-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/10">
          <AlertCircle className="h-7 w-7 text-red-500" />
        </div>
        <p className="text-text-primary font-medium text-center">{error}</p>
        <button
          type="button"
          onClick={refetch}
          className="text-sm text-brand hover:text-brand/80 underline-offset-4 hover:underline transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  // ── Empty state ──────────────────────────────────────────────────────────
  if (conversations.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <EmptyState onConversationCreated={refetch} />
      </div>
    );
  }

  // ── Has conversations ────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <ConversationList
        conversations={conversations}
        activeId={activeConversation?.id ?? null}
        onSelect={setActiveConversation}
        onConversationCreated={refetch}
      />

      {/* Right pane placeholder */}
      <main className="flex flex-1 flex-col items-center justify-center gap-3 text-text-secondary">
        {activeConversation ? (
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm font-medium text-text-primary">
              Conversation #{activeConversation.id}
            </p>
            <p className="text-xs">Message pane coming soon</p>
          </div>
        ) : (
          <>
            <p className="text-sm font-medium">Select a conversation</p>
            <p className="text-xs">
              Choose from the list on the left to start messaging
            </p>
          </>
        )}
      </main>
    </div>
  );
}
