import { Button } from "@shared/ui";
import { Mail } from "lucide-react";

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
      <p className="text-sm font-medium">No user found</p>
      {isEmail ? (
        <>
          <p className="mb-2 text-xs">Start conversation with {query} </p>
          <Button
            variant="outline"
            size="sm"
            onClick={onInvite}
            disabled={isInviting || inviteSent || !!remainingTime}
            className="flex w-full items-center justify-center gap-2"
          >
            <Mail className="h-4 w-4" />
            {isInviting
              ? "Sending invite..."
              : inviteSent
                ? "Invite Sent"
                : remainingTime
                  ? `Available in ${remainingTime}`
                  : "Send Invite"}
          </Button>
        </>
      ) : (
        <p className="text-xs">Try a different username or email</p>
      )}
    </div>
  );
}
