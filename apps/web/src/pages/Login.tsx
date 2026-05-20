import { zodResolver } from "@hookform/resolvers/zod";
import { authApi } from "@shared/api";
import { ROUTES } from "@shared/constants";
import { authText } from "@shared/constants/strings/index.en";
import { AuthCard, Button, ErrorBanner, FormField, Link } from "@shared/ui";
import { extractApiError } from "@shared/utils";
import { type LoginFormValues, loginSchema } from "@shared/validation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

import { useAuth } from "@/providers";

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const { setUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    try {
      const response = await authApi.login({
        username: data.identifier,
        password: data.password,
      });
      setUser(response.user);
      navigate(ROUTES.CHAT);
    } catch (err: unknown) {
      setError(extractApiError(err, authText.credentialsError));
    }
  };

  return (
    <AuthCard
      title={authText.welcomeBack}
      description={authText.enterEmailPassword}
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
