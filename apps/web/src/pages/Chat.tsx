import {
  dashboardText,
  inviteText,
  sharedText,
} from "@shared/constants/strings/index.en";
import type { Conversation } from "@shared/types/conversation";
import { Spinner, useToast } from "@shared/ui";
import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { usePresenceContext } from "@/providers";

import { ConversationList } from "../features/chat/components/ConversationList";
import { EmptyState } from "../features/chat/components/EmptyState";
import { MessagePane } from "../features/chat/components/MessagePane";
import { PendingInvitePanel } from "../features/chat/components/PendingInvitePanel";
import { useConversations } from "../features/chat/hooks/useConversations";
import { useUserSocket } from "../features/chat/hooks/useUserSocket";

export default function Chat() {
  const { conversations, isLoading, error, refetch, applyUpdate } =
    useConversations();
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);
  const { toast } = useToast();
  const { apply: applyPresence, registerVisibilitySender } =
    usePresenceContext();

  // Per-user WebSocket: receive cross-conversation pushes so the sidebar
  // updates in realtime without one socket per conversation. Keeps the
  // active conversation reference in sync so transient state on it
  // (e.g. invitation.is_accepted flipping when a peer accepts) is reflected
  // immediately.
  const { send } = useUserSocket((event) => {
    if (event.type === "conversation_updated") {
      applyUpdate(event.data);
      setActiveConversation((current) =>
        current && current.id === event.data.id ? event.data : current,
      );
      return;
    }
    if (event.type === "invite_accepted") {
      const name =
        [event.data.acceptor.first_name, event.data.acceptor.last_name]
          .filter(Boolean)
          .join(" ")
          .trim() || event.data.acceptor.username;
      toast({
        title: `🎉 ${name}`,
        message: inviteText.joinedToast,
      });
      return;
    }
    if (event.type === "presence_changed") {
      applyPresence(event.data);
    }
  });

  // Visibility ping: tell the backend whether this tab is focused so it can
  // flip our presence to away/online. Initial state is sent once on mount;
  // subsequent transitions piggyback on the document visibilitychange event.
  // Also exposes the sender on the presence context so the UserMenu can
  // manually override the status — see PresenceProvider.setManualPresence.
  useEffect(() => {
    const sendVisibility = (visible: boolean) =>
      send({ action: "visibility", data: { visible } });
    const fireFromDocument = () =>
      sendVisibility(document.visibilityState === "visible");

    fireFromDocument();
    registerVisibilitySender(sendVisibility);
    document.addEventListener("visibilitychange", fireFromDocument);
    return () => {
      registerVisibilitySender(null);
      document.removeEventListener("visibilitychange", fireFromDocument);
    };
  }, [send, registerVisibilitySender]);

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
          {sharedText.tryAgain}
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
            <p className="text-sm font-medium">
              {dashboardText.selectConversationTitle}
            </p>
            <p className="text-xs">{dashboardText.selectConversationHint}</p>
          </div>
        )}
      </main>
    </div>
  );
}
