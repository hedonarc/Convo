import * as React from "react";
import { cn } from "@shared/utils";

import { cva, type VariantProps } from "class-variance-authority";
import { sharedText } from "@shared/constants/strings/index.en";

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);

export interface LabelProps
  extends React.ComponentPropsWithRef<"label">,
    VariantProps<typeof labelVariants> {
  required?: boolean;
}

const Label = ({
  className,
  children,
  required,
  ...props
}: LabelProps) => (
  <label
    className={cn(labelVariants(), className)}
    {...props}
  >
    {children}
    {required && <span className="ml-1 text-red-500 dark:text-red-400">{sharedText.requiredSymbol}</span>}
  </label>
);
Label.displayName = "Label";

export { Label, labelVariants };
