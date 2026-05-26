import { zodResolver } from "@hookform/resolvers/zod";
import { authApi, conversationsApi } from "@shared/api";
import { ROUTES } from "@shared/constants";
import { authText, inviteText } from "@shared/constants/strings/index.en";
import { AuthCard, Button, ErrorBanner, FormField, Link } from "@shared/ui";
import { extractApiError } from "@shared/utils";
import { type LoginFormValues, loginSchema } from "@shared/validation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router";

import { useAuth } from "@/providers";

interface InviteState {
  inviteToken?: string;
  inviteEmail?: string;
  inviterName?: string;
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const { setUser } = useAuth();

  const inviteState = (location.state ?? {}) as InviteState;
  const { inviteToken, inviteEmail, inviterName } = inviteState;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: inviteEmail ?? "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    try {
      const response = await authApi.login({
        username: data.identifier,
        password: data.password,
      });
      setUser(response.user);

      // Best-effort accept-after-login when the user arrived via an invite.
      // Failures are swallowed — the user is still logged in and can find
      // the invite again from their email if anything goes sideways.
      if (inviteToken) {
        try {
          await conversationsApi.acceptInvite(inviteToken);
        } catch {
          /* best-effort */
        }
      }

      navigate(ROUTES.CHAT);
    } catch (err: unknown) {
      setError(extractApiError(err, authText.credentialsError));
    }
  };

  const title = inviterName
    ? inviteText.welcomeBackInvitee
    : authText.welcomeBack;
  const description = inviterName
    ? `${inviteText.welcomeBackDescription} ${inviterName}. ${inviteText.signInToContinue}.`
    : authText.enterEmailPassword;

  return (
    <AuthCard
      title={title}
      description={description}
      onSubmit={handleSubmit(onSubmit)}
      footer={
        <>
          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? authText.loggingIn : authText.login}
          </Button>
          <div className="text-text-secondary text-center text-sm">
            {authText.dontHaveAccount}
            <Link to={ROUTES.REGISTER}>{authText.register}</Link>
          </div>
        </>
      }
    >
      <ErrorBanner message={error} />
      <FormField
        id="identifier"
        type="text"
        label={authText.emailOrUsername}
        placeholder={authText.emailOrUsernamePlaceholder}
        error={errors.identifier?.message}
        {...register("identifier")}
      />
      <FormField
        id="password"
        type="password"
        label={authText.password}
        error={errors.password?.message}
        {...register("password")}
      />
    </AuthCard>
  );
}
