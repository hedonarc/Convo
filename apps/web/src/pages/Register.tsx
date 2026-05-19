import { zodResolver } from "@hookform/resolvers/zod";
import { authApi } from "@shared/api";
import { ROUTES } from "@shared/constants";
import { authText } from "@shared/constants/strings/index.en";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Link,
} from "@shared/ui";
import { extractApiError } from "@shared/utils";
import { type RegisterFormValues, registerSchema } from "@shared/validation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router";
import { conversationsApi } from "@shared/api/conversations.api";

import { useAuth } from "@/providers";

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("invite");
  const emailFromUrl = searchParams.get("email");
  const [error, setError] = useState<string | null>(null);
  const { setUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: emailFromUrl || "",
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
        } catch (err) {
          console.error("Failed to accept invite:", err);
        }
      }
      
      navigate(ROUTES.CHAT);
    } catch (err: unknown) {
      setError(extractApiError(err, authText.registrationFailed));
    }
  };

  return (
    <div className="full-center px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Create an account
          </CardTitle>
          <CardDescription>{authText.enterDetails}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-500 dark:bg-red-900/10 dark:text-red-400">
                {error}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{authText.firstName}</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  error={!!errors.firstName}
                  {...register("firstName")}
                />
                {errors.firstName && (
                  <p className="text-sm font-medium text-red-500">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{authText.lastName}</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  error={!!errors.lastName}
                  {...register("lastName")}
                />
                {errors.lastName && (
                  <p className="text-sm font-medium text-red-500">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{authText.email}</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                readOnly={!!inviteToken}
                className={inviteToken ? "bg-brand/5 cursor-not-allowed text-text-secondary" : ""}
                error={!!errors.email}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm font-medium text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">{authText.username}</Label>
              <Input
                id="username"
                type="text"
                placeholder="johndoe"
                error={!!errors.username}
                {...register("username")}
              />
              {errors.username && (
                <p className="text-sm font-medium text-red-500">
                  {errors.username.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{authText.password}</Label>
              <Input
                id="password"
                type="password"
                error={!!errors.password}
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm font-medium text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                {authText.confirmPassword}
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                error={!!errors.confirmPassword}
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-sm font-medium text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? authText.creatingAccount : authText.createAccount}
            </Button>
            <div className="text-text-secondary text-center text-sm">
              {authText.alreadyHaveAccount}
              <Link to={ROUTES.LOGIN}>{authText.login}</Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
