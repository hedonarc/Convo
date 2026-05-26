import { conversationsApi } from "@shared/api";
import { inviteText } from "@shared/constants/strings/index.en";
import type { Conversation } from "@shared/types/conversation";
import { Button, Spinner } from "@shared/ui";
import axios from "axios";
import { Clock3, Repeat } from "lucide-react";
import { useState } from "react";

import { useCountdown } from "../hooks/useCountdown";

const COOLDOWN_MS = 24 * 60 * 60 * 1000;

interface PendingInvitePanelProps {
  conversation: Conversation;
}

export function PendingInvitePanel({ conversation }: PendingInvitePanelProps) {
  const invitation = conversation.invitation;

  const [resending, setResending] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [cooldownUntilMs, setCooldownUntilMs] = useState<number | null>(() =>
    invitation ? new Date(invitation.updated_at).getTime() + COOLDOWN_MS : null,
  );

  const remainingTime = useCountdown(cooldownUntilMs, 60 * 1000);

  if (!invitation) return null;

  const handleResendInvite = async () => {
    if (resending || remainingTime) return;

    setResending(true);
    setResendError(null);
    setResendSuccess(false);

    try {
      await conversationsApi.createInvite(invitation.email);
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 3000);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        const errorData = error.response.data;
        setResendError(errorData.error || inviteText.rateLimitFallback);

        if (errorData.available_after) {
          setCooldownUntilMs(new Date(errorData.available_after).getTime());
        }
      } else {
        setResendError(inviteText.resendFailed);
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="animate-in fade-in zoom-in-95 flex max-w-sm flex-col items-center text-center duration-500">
      <div className="bg-brand/10 mb-6 flex h-20 w-20 items-center justify-center rounded-full">
        <Clock3 className="text-brand h-10 w-10" />
      </div>

      <h3 className="text-text-primary mb-2 text-lg font-semibold">
        {inviteText.pendingTitle}
      </h3>

      <p className="text-text-secondary mb-1 text-sm">
        {inviteText.youInvited} {invitation.email}
      </p>

      <p className="text-text-secondary mb-6 text-xs italic">
        {inviteText.waitingToJoin}
      </p>

      {resendError && (
        <p className="animate-in fade-in slide-in-from-top-1 mb-4 text-xs text-red-500">
          {resendError}
        </p>
      )}

      {resendSuccess && (
        <p className="text-brand animate-in fade-in slide-in-from-top-1 mb-4 text-xs">
          {inviteText.reminderSent}
        </p>
      )}

      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={handleResendInvite}
        disabled={resending || resendSuccess || !!remainingTime}
      >
        {resending ? <Spinner size="sm" /> : <Repeat className="h-4 w-4" />}
        {remainingTime
          ? `${inviteText.resendIn} ${remainingTime}`
          : resendSuccess
            ? inviteText.sentBadge
            : inviteText.resendInvite}
      </Button>
    </div>
  );
}
