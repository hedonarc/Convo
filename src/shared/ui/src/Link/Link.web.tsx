import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { Link as RouterLink, type To } from "react-router";

import { cn } from "@/shared/utils";

const linkVariants = cva("transition-colors", {
  variants: {
    variant: {
      default:
        "font-medium text-brand underline underline-offset-4 hover:text-brand/80",
      button: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface LinkProps
  extends
    React.ComponentPropsWithoutRef<typeof RouterLink>,
    VariantProps<typeof linkVariants> {
  // Re-typed from react-router's own `To` (`string | Partial<Path>`).
  // Was `any` previously — properly typing it costs nothing and silences
  // the no-explicit-any rule.
  to: To;
  children?: React.ReactNode;
  className?: string;
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <RouterLink
        ref={ref}
        className={cn(linkVariants({ variant }), className)}
        {...props}
      />
    );
  },
);

Link.displayName = "Link";

export { Link, linkVariants };
