import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@shared/utils";
import { sharedText } from "@shared/constants/strings/index.en";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-brand text-brand-foreground shadow hover:bg-brand/90",
        destructive:
          "bg-red-500 text-gray-50 shadow-sm hover:bg-red-500/90 dark:bg-red-900 dark:text-gray-50",
        outline:
          "border border-border bg-surface shadow-sm hover:bg-gray-100 hover:text-text-primary dark:hover:bg-gray-800 dark:hover:text-gray-50",
        secondary:
          "bg-gray-100 text-gray-900 shadow-sm hover:bg-gray-100/80 dark:bg-gray-800 dark:text-gray-50 dark:hover:bg-gray-800/80",
        ghost: "hover:bg-gray-100 hover:text-text-primary dark:hover:bg-gray-800 dark:hover:text-gray-50",
        link: "text-text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-sm",
        lg: "h-11 rounded-md px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ComponentPropsWithRef<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = ({
  className,
  variant,
  size,
  loading,
  children,
  type,
  ...props
}: ButtonProps) => {
  return (
    <button
      type={type}
      className={cn(
        buttonVariants({ variant, size }),
        type === "submit" && "cursor-pointer hover:cursor-pointer",
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {children}
    </button>
  );
};

Button.displayName = sharedText.button;

export { Button, buttonVariants };
