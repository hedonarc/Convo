import * as React from "react";
import { cn } from "@shared/utils";

import { cva, type VariantProps } from "class-variance-authority";

const inputVariants = cva(
  "flex h-9 w-full rounded-md border bg-input px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      state: {
        default: "border-border",
        error: "border-red-500 focus-visible:ring-red-500 dark:border-red-400 dark:focus-visible:ring-red-400",
      },
    },
    defaultVariants: {
      state: "default",
    },
  }
);

export interface InputProps
  extends React.ComponentPropsWithRef<"input">,
    VariantProps<typeof inputVariants> {
  error?: boolean;
}

const Input = ({ className, type, error, state, ...props }: InputProps) => {
  return (
    <input
      type={type}
      className={cn(inputVariants({ state: error ? "error" : state, className }))}
      {...props}
    />
  );
};
Input.displayName = "Input";

export { Input, inputVariants };
