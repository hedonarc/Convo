import * as React from "react";
import { Link as RouterLink } from "react-router";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@shared/utils";
import { sharedText } from "@shared/constants/strings/index.en";

const linkVariants = cva(
  "transition-colors",
  {
    variants: {
      variant: {
        default: "font-medium text-brand underline underline-offset-4 hover:text-brand/80",
        button: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface LinkProps
  extends React.ComponentPropsWithoutRef<typeof RouterLink>,
    VariantProps<typeof linkVariants> {
  to: any;
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
  }
);

Link.displayName = "Link";

export { Link, linkVariants };

