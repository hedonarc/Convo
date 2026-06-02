import { Mail } from "lucide-react";

import { inviteText } from "@/shared/constants/strings/index.en";
import { Button } from "@/shared/ui";

interface InviteByEmailCtaProps {
  query: string;
  isEmail: boolean;
  isInviting: boolean;
  inviteSent: boolean;
  remainingTime: string | null;
  onInvite: () => void;
}

export function InviteByEmailCta({
  query,
  isEmail,
  isInviting,
  inviteSent,
  remainingTime,
  onInvite,
}: InviteByEmailCtaProps) {
  return (
    <div className="text-text-secondary flex flex-col items-center gap-3 px-4 py-6 text-center">
      <p className="text-sm font-medium">{inviteText.noUserFound}</p>
      {isEmail ? (
        <>
          <p className="mb-2 text-xs">
            {inviteText.startConversationWith} {query}{" "}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={onInvite}
            disabled={isInviting || inviteSent || !!remainingTime}
            className="flex w-full items-center justify-center gap-2"
          >
            <Mail className="h-4 w-4" />
            {isInviting
              ? inviteText.sendingInvite
              : inviteSent
                ? inviteText.inviteSentBadge
                : remainingTime
                  ? `${inviteText.availableIn} ${remainingTime}`
                  : inviteText.sendInvite}
          </Button>
        </>
      ) : (
        <p className="text-xs">{inviteText.tryDifferentSearch}</p>
      )}
    </div>
  );
}
