import { zodResolver } from "@hookform/resolvers/zod";
import { authApi, conversationsApi } from "@shared/api";
import { ROUTES } from "@shared/constants";
import { authText } from "@shared/constants/strings/index.en";
import { AuthCard, Button, ErrorBanner, FormField, Link } from "@shared/ui";
import { extractApiError } from "@shared/utils";
import { type RegisterFormValues, registerSchema } from "@shared/validation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate, useSearchParams } from "react-router";

import { useAuth } from "@/providers";

interface InviteState {
  inviteToken?: string;
  inviteEmail?: string;
  inviterName?: string;
}

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  // Preferred path: invite is in router state (forwarded by the Invite page).
  // Legacy fallback: support the old /register?invite=...&email=... emails
  // still in inboxes — we scrub the query string from the URL on mount so
  // the raw token doesn't sit in history/bookmarks.
  const inviteState = (location.state ?? {}) as InviteState;
  const inviteToken =
    inviteState.inviteToken || searchParams.get("invite") || null;
  const initialEmail =
    inviteState.inviteEmail || searchParams.get("email") || "";

  useEffect(() => {
    if (searchParams.get("invite") || searchParams.get("email")) {
      window.history.replaceState(null, "", ROUTES.REGISTER);
    }
  }, [searchParams]);

  const [error, setError] = useState<string | null>(null);
  const { setUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: initialEmail,
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setError(null);
    try {
      const response = await authApi.register({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        username: data.username,
        password: data.password,
        confirm_password: data.confirmPassword,
      });
      setUser(response.user);

      if (inviteToken) {
        try {
          await conversationsApi.acceptInvite(inviteToken);
        } catch {
          // Invite acceptance is best-effort; registration still succeeds.
        }
      }

      navigate(ROUTES.CHAT);
    } catch (err: unknown) {
      setError(extractApiError(err, authText.registrationFailed));
    }
  };

  return (
    <AuthCard
      title={authText.createAccount}
      description={authText.enterDetails}
      onSubmit={handleSubmit(onSubmit)}
      footer={
        <>
          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? authText.creatingAccount : authText.createAccount}
          </Button>
          <div className="text-text-secondary text-center text-sm">
            {authText.alreadyHaveAccount}{" "}
            <Link to={ROUTES.LOGIN}>{authText.login}</Link>
          </div>
        </>
      }
    >
      <ErrorBanner message={error} />
      <div className="grid grid-cols-2 gap-4">
        <FormField
          id="firstName"
          label={authText.firstName}
          placeholder={authText.firstNamePlaceholder}
          error={errors.firstName?.message}
          {...register("firstName")}
        />
        <FormField
          id="lastName"
          label={authText.lastName}
          placeholder={authText.lastNamePlaceholder}
          error={errors.lastName?.message}
          {...register("lastName")}
        />
      </div>
      <FormField
        id="email"
        type="email"
        label={authText.email}
        placeholder={authText.emailPlaceholder}
        readOnly={!!inviteToken}
        className={
          inviteToken ? "bg-brand/5 text-text-secondary cursor-not-allowed" : ""
        }
        error={errors.email?.message}
        {...register("email")}
      />
      <FormField
        id="username"
        type="text"
        label={authText.username}
        placeholder={authText.usernamePlaceholder}
        error={errors.username?.message}
        {...register("username")}
      />
      <FormField
        id="password"
        type="password"
        label={authText.password}
        error={errors.password?.message}
        {...register("password")}
      />
      <FormField
        id="confirmPassword"
        type="password"
        label={authText.confirmPassword}
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />
    </AuthCard>
  );
}
