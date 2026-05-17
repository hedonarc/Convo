import * as React from "react";
import { cn } from "@shared/utils";

export interface ButtonProps
  extends React.ComponentPropsWithRef<"button"> {
  asChild?: boolean;
  loading?: boolean;
  size?: "sm" | "md" | "lg" | "icon";
}

const sizes = {
  sm: "h-8 px-3 text-sm",
  md: "h-9 px-4 py-2",
  lg: "h-11 rounded-md px-8 text-base",
  icon: "h-10 w-10",
};

const Button = ({ className, loading, size = "md", children, ...props }: ButtonProps) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-gray-300",
        "bg-gray-900 text-gray-50 shadow hover:bg-gray-900/90 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90",
        sizes[size],
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? "Loading..." : children}
    </button>
  );
};
Button.displayName = "Button";

export { Button };
