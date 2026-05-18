import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@shared/utils";
import { sharedText } from "@shared/constants/strings/index.en";

const cardVariants = cva(
  "rounded-xl border border-border bg-surface text-text-primary shadow"
);

export interface CardProps
  extends React.ComponentPropsWithRef<"div">,
    VariantProps<typeof cardVariants> {}

const Card = ({ className, ...props }: CardProps) => (
  <div
    className={cn(cardVariants(), className)}
    {...props}
  />
);
Card.displayName = sharedText.card;

const CardHeader = ({
  className,
  ...props
}: React.ComponentPropsWithRef<"div">) => (
  <div
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
);
CardHeader.displayName = "CardHeader";

const CardTitle = ({
  className,
  ...props
}: React.ComponentPropsWithRef<"h3">) => (
  <h3
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
);
CardTitle.displayName = "CardTitle";

const CardDescription = ({
  className,
  ...props
}: React.ComponentPropsWithRef<"p">) => (
  <p
    className={cn("text-sm text-text-secondary", className)}
    {...props}
  />
);
CardDescription.displayName = "CardDescription";

const CardContent = ({
  className,
  ...props
}: React.ComponentPropsWithRef<"div">) => (
  <div className={cn("p-6 pt-0", className)} {...props} />
);
CardContent.displayName = "CardContent";

const CardFooter = ({
  className,
  ...props
}: React.ComponentPropsWithRef<"div">) => (
  <div
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
);
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
