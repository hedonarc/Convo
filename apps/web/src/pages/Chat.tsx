import {
  dashboardText,
  inviteText,
  sharedText,
} from "@shared/constants/strings/index.en";
import type { Conversation } from "@shared/types/conversation";
import { Spinner, useToast } from "@shared/ui";
import { cn } from "@shared/utils";
import { AlertCircle, ArrowLeft } from "lucide-react";
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
  const {
    apply: applyPresence,
    registerVisibilitySender,
    registerStatusSender,
  } = usePresenceContext();

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

  // Visibility ping: tell the backend whenever this tab focuses or blurs
  // so peers see us flip between online and away. Also exposes the sender
  // on the presence context so the UserMenu can manually override the
  // status — see PresenceProvider.setManualPresence.
  //
  // We deliberately do NOT fire on mount. UserConsumer.connect already
  // calls mark_online when the socket opens, so the initial state is
  // correct without a client-side ping. Firing here would race with
  // manual overrides: in strict mode / hot-reload the effect can re-run,
  // and an unwanted visible=true would immediately clobber a fresh
  // "Set as Away" before the user could see it take effect.
  useEffect(() => {
    const sendVisibility = (visible: boolean) =>
      send({ action: "visibility", data: { visible } });
    const sendStatus = (status: "online" | "away") =>
      send({ action: "set_status", data: { status } });
    const fireFromDocument = () =>
      sendVisibility(document.visibilityState === "visible");

    registerVisibilitySender(sendVisibility);
    registerStatusSender(sendStatus);
    document.addEventListener("visibilitychange", fireFromDocument);
    return () => {
      registerVisibilitySender(null);
      registerStatusSender(null);
      document.removeEventListener("visibilitychange", fireFromDocument);
    };
  }, [send, registerVisibilitySender, registerStatusSender]);

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

  const handleBack = () => setActiveConversation(null);

  // On mobile we show a single pane at a time: the conversation list takes
  // the full viewport, and selecting a conversation swaps in the message
  // pane. A header back button returns to the list. On md+ both panes are
  // visible side-by-side.
  const hasActive = !!activeConversation;

  // ── Has conversations ────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden">
      <div
        className={cn(
          "h-full md:flex md:w-72 md:shrink-0",
          hasActive ? "hidden" : "flex w-full",
        )}
      >
        <ConversationList
          conversations={conversations}
          activeId={activeConversation?.id ?? null}
          onSelect={setActiveConversation}
          onConversationCreated={handleCreated}
        />
      </div>

      <main
        className={cn(
          "min-w-0 flex-1 flex-col md:flex",
          hasActive ? "flex" : "hidden",
        )}
      >
        {activeConversation ? (
          isPendingInvite ? (
            <>
              <div className="border-border bg-surface flex shrink-0 items-center gap-2 border-b px-2 py-2 md:hidden">
                <button
                  type="button"
                  onClick={handleBack}
                  aria-label={sharedText.backToConversations}
                  className="text-text-secondary hover:text-text-primary hover:bg-brand/5 focus-visible:ring-ring flex h-9 w-9 items-center justify-center rounded-md transition-colors focus-visible:ring-1 focus-visible:outline-none"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              </div>
              <div className="center flex-1 px-6">
                <PendingInvitePanel
                  key={activeConversation.id}
                  conversation={activeConversation}
                />
              </div>
            </>
          ) : (
            // Deliberately *not* keyed by conversation.id. useMessages
            // already swaps state internally when conversationId changes,
            // and keeping the DOM stable across switches lets the in-pane
            // cross-fade in MessagePane actually have something to animate.
            <MessagePane
              conversation={activeConversation}
              onBack={handleBack}
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
