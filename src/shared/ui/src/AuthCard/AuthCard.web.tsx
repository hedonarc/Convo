import * as React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../Card";

export interface AuthCardProps {
  title: string;
  description: string;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  footer: React.ReactNode;
  children: React.ReactNode;
}

const AuthCard = ({
  title,
  description,
  onSubmit,
  footer,
  children,
}: AuthCardProps) => (
  <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight">
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">{children}</CardContent>
        <CardFooter className="flex flex-col space-y-4">{footer}</CardFooter>
      </form>
    </Card>
  </div>
);
AuthCard.displayName = "AuthCard";

export { AuthCard };
