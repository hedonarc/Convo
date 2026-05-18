import { useAuth } from "@/providers";
import { zodResolver } from "@hookform/resolvers/zod";
import { authApi } from "@shared/api";
import { ROUTES } from "@shared/constants";
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
import { type LoginFormValues, loginSchema } from "@shared/validation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { authText } from "@shared/constants/strings/index.en";

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
    <div className="full-center px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">
            {authText.welcomeBack}
          </CardTitle>
          <CardDescription>{authText.enterEmailPassword}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-500 dark:bg-red-900/10 dark:text-red-400">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="identifier">{authText.emailOrUsername}</Label>
              <Input
                id="identifier"
                type="text"
                placeholder={authText.usernamePlaceholder}
                error={!!errors.identifier}
                {...register("identifier")}
              />
              {errors.identifier && (
                <p className="text-sm font-medium text-red-500">
                  {errors.identifier.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{authText.password}</Label>
              </div>
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
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? authText.loggingIn : authText.login}
            </Button>
            <div className="text-text-secondary text-center text-sm">
              {authText.dontHaveAccount}
              <Link to={ROUTES.REGISTER}>{authText.register}</Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
