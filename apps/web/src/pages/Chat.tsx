import { conversationsApi } from "@shared/api";
import type { Conversation } from "@shared/types/conversation";
import { Button, Spinner } from "@shared/ui";
import { AlertCircle, Clock3, Repeat} from "lucide-react";
import { useState, useEffect } from "react";
import { ConversationList } from "../features/chat/components/ConversationList";
import { EmptyState } from "../features/chat/components/EmptyState";
import { useConversations } from "../features/chat/hooks/useConversations";

/**
 * Formats milliseconds into a countdown string:
 * - 23h 14m
 * - 12m 03s
 * - 45s
 */
const formatCooldown = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    const s = seconds % 60;
    return `${minutes}m ${s < 10 ? `0${s}` : s}s`;
  }
  return `${seconds}s`;
};

export default function Chat() {
  const { conversations, isLoading, error, refetch } = useConversations();
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);

  const [resending, setResending] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);
  
  // Cooldown state
  const [remainingTime, setRemainingTime] = useState<string | null>(null);

  // Reset resend state when active conversation changes
  useEffect(() => {
    setResending(false);
    setResendError(null);
    setResendSuccess(false);
    setRemainingTime(null);
  }, [activeConversation?.id]);

  // Countdown timer effect
  useEffect(() => {
    if (!activeConversation?.invitation || activeConversation?.invitation?.is_accepted) return;
    
    const updateCountdown = () => {
      const now = new Date().getTime();
      const target = new Date(activeConversation?.invitation.updated_at).getTime() + (24 * 60 * 60 * 1000);

      const diff = target - now;

      if (diff <= 0) {
        setRemainingTime(null);
      } else {
        setRemainingTime(formatCooldown(diff));
      }
    };

    // Run once immediately
    updateCountdown();

    const interval = setInterval(updateCountdown, 60 * 1000);
    return () => clearInterval(interval);
  }, [activeConversation]);

  const handleResendInvite = async () => {
    if (!activeConversation?.invitation?.email || resending || !!remainingTime) return;
    
    setResending(true);
    setResendError(null);
    setResendSuccess(false);
    
    try {
      await conversationsApi.createInvite(activeConversation.invitation.email);
      setResendSuccess(true);
      // Reset success message after 3 seconds
      setTimeout(() => setResendSuccess(false), 3000);
    } catch (error: any) {
      if (error.response?.status === 429) {
        const errorData = error.response.data;
        setResendError(errorData.error || "Rate limit exceeded.");
        
        if (errorData.available_after) {
          const diff = new Date(errorData.available_after).getTime() - new Date().getTime();
          
          if (diff > 0) {
            setRemainingTime(formatCooldown(diff));
          }
        }
      } else {
        setResendError("Failed to resend invite.");
      }
    } finally {
      setResending(false);
    }
  };

  const handleCreated = async (conversation: Conversation) => {
    await refetch();
    setActiveConversation(conversation);
  };

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
        <EmptyState onConversationCreated={handleCreated} />
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
        onConversationCreated={handleCreated}
      />

      {/* Right pane placeholder */}
      <main className="flex flex-1 flex-col items-center justify-center gap-3 text-text-secondary">
        {activeConversation ? (
          <div className="flex flex-col items-center gap-2">
            <div className="flex-1 flex flex-col items-center justify-center p-6">
              {activeConversation.invitation && !activeConversation.invitation.is_accepted ? (
                <div className="flex flex-col items-center text-center max-w-sm animate-in fade-in zoom-in-95 duration-500">
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand/10">
                    <Clock3 className="h-10 w-10 text-brand" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    Pending Invitation
                  </h3>
                  
                  <p className="text-sm text-text-secondary mb-1">
                    You invited {activeConversation.invitation?.email}
                  </p>

                  <p className="text-xs text-text-secondary italic mb-6">
                    Waiting for them to join
                  </p>

                  {resendError && (
                    <p className="text-xs text-red-500 mb-4 animate-in fade-in slide-in-from-top-1">
                      {resendError}
                    </p>
                  )}

                  {resendSuccess && (
                    <p className="text-xs text-brand mb-4 animate-in fade-in slide-in-from-top-1">
                      Reminder sent successfully!
                    </p>
                  )}

                  <Button 
                    variant="outline" 
                    size="sm"
                    className="gap-2"
                    onClick={handleResendInvite}
                    disabled={resending || resendSuccess || !!remainingTime}
                  >
                      {resending ? (
                        <Spinner size="sm" />
                      ) : (
                        <Repeat className="h-4 w-4" />
                      )}
                      {remainingTime ? `Resend in ${remainingTime}` : resendSuccess ? "Sent!" : "Resend Invite"}

                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-text-secondary">
                  <p className="text-sm font-medium text-text-primary">
                    Conversation #{activeConversation.id}
                  </p>
                  <p className="text-xs">Message pane coming soon</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-text-secondary">
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
