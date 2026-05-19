import { conversationsApi } from "@shared/api";
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
        setResendError(errorData.error || "Rate limit exceeded.");

        if (errorData.available_after) {
          setCooldownUntilMs(new Date(errorData.available_after).getTime());
        }
      } else {
        setResendError("Failed to resend invite.");
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex flex-col items-center text-center max-w-sm animate-in fade-in zoom-in-95 duration-500">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand/10">
        <Clock3 className="h-10 w-10 text-brand" />
      </div>

      <h3 className="text-lg font-semibold text-text-primary mb-2">
        Pending Invitation
      </h3>

      <p className="text-sm text-text-secondary mb-1">
        You invited {invitation.email}
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
        {remainingTime
          ? `Resend in ${remainingTime}`
          : resendSuccess
            ? "Sent!"
            : "Resend Invite"}
      </Button>
    </div>
  );
}
