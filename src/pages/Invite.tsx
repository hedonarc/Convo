import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { useAuth } from "@/providers";
import { conversationsApi } from "@/shared/api";
import { ROUTES } from "@/shared/constants";
import { inviteText } from "@/shared/constants/strings/index.en";
import type { InviteResolveResponse } from "@/shared/types/invite";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ErrorBanner,
  Spinner,
} from "@/shared/ui";
import { extractApiError } from "@/shared/utils";

/**
 * Pre-registration "Accept Invite" screen.
 *
 * The token comes from the URL (/invite/:token) — we read it once into state
 * and strip it from the address bar via history.replaceState so the user
 * can't accidentally bookmark or share the raw token. Inviter name + the
 * canonical invited email are fetched from the backend by token; we never
 * trust client-supplied email.
 */
export default function Invite() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [invite, setInvite] = useState<InviteResolveResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(!!token);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    if (!token) return;

    // Scrub the raw token from the browser's URL bar. We keep it in component
    // state for the lifetime of the page; a reload will lose it, which is the
    // safe default — users should click the email link again rather than
    // bookmark a sensitive token.
    window.history.replaceState(null, "", "@/shared/invite");

    let cancelled = false;
    (async () => {
      try {
        const data = await conversationsApi.resolveInvite(token);
        if (!cancelled) setInvite(data);
      } catch (err) {
        if (!cancelled)
          setError(extractApiError(err, inviteText.invalidDescription));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // ── Error / invalid token ────────────────────────────────────────────────
  if (error || !invite) {
    return (
      <InviteShell
        title={inviteText.invalidTitle}
        description={inviteText.invalidDescription}
      >
        <ErrorBanner message={error} />
      </InviteShell>
    );
  }

  // ── Already accepted ─────────────────────────────────────────────────────
  if (invite.is_accepted) {
    return (
      <InviteShell
        title={inviteText.alreadyAcceptedTitle}
        description={inviteText.alreadyAcceptedDescription}
      >
        <Button className="w-full" onClick={() => navigate(ROUTES.CHAT)}>
          {inviteText.openChat}
        </Button>
      </InviteShell>
    );
  }

  const inviterName = displayName(invite.inviter);

  // ── Existing account, logged in → one-tap continue ──────────────────────
  // The backend doesn't enforce email match on accept (it adds the current
  // user as a participant), so a signed-in user can join from any device.
  if (invite.has_account && isAuthenticated) {
    const onContinue = async () => {
      if (!token) return;
      setAccepting(true);
      try {
        await conversationsApi.acceptInvite(token);
        navigate(ROUTES.CHAT);
      } catch (err) {
        setError(extractApiError(err, inviteText.invalidDescription));
        setAccepting(false);
      }
    };
    return (
      <InviteShell
        title={inviteText.welcomeBackInvitee}
        description={`${inviteText.welcomeBackDescription} ${inviterName}.`}
      >
        <ErrorBanner message={error} />
        <Button className="w-full" onClick={onContinue} disabled={accepting}>
          {accepting ? inviteText.joining : inviteText.continueToConversation}
        </Button>
      </InviteShell>
    );
  }

  // ── Existing account, logged out → route to Login w/ invite state ────────
  if (invite.has_account) {
    const onSignIn = () => {
      navigate(ROUTES.LOGIN, {
        state: {
          inviteToken: token,
          inviteEmail: invite.email,
          inviterName,
        },
      });
    };
    return (
      <InviteShell
        title={inviteText.welcomeBackInvitee}
        description={`${inviteText.welcomeBackDescription} ${inviterName}.`}
      >
        <Button className="w-full" onClick={onSignIn}>
          {inviteText.signInToContinue}
        </Button>
      </InviteShell>
    );
  }

  // ── Default: no-account → Accept → Register ──────────────────────────────
  const onAccept = () => {
    // Pass the resolved token + canonical email to Register via router state.
    // Register no longer reads them from the query string — the token never
    // reappears in the URL after this point.
    navigate(ROUTES.REGISTER, {
      state: {
        inviteToken: token,
        inviteEmail: invite.email,
        inviterName,
      },
    });
  };

  return (
    <InviteShell
      title={`${inviterName} ${inviteText.invitedYou}`}
      description={invite.email}
    >
      <Button className="w-full" onClick={onAccept}>
        {inviteText.acceptInvite}
      </Button>
    </InviteShell>
  );
}

function InviteShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          {children}
        </CardContent>
      </Card>
    </div>
  );
}

function displayName(user: InviteResolveResponse["inviter"]): string {
  const full = [user.first_name, user.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  return full || user.username;
}
