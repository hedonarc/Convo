import * as React from "react";
import { cn } from "@shared/utils";

const Label = ({
  className,
  ...props
}: React.ComponentPropsWithRef<"label">) => (
  <label
    className={cn(
      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    )}
    {...props}
  />
);
Label.displayName = "Label";

export { Label };
