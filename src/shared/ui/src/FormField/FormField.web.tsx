import { cn } from "@/shared/utils";

import { Input, type InputProps } from "../Input";
import { Label } from "../Label";

export interface FormFieldProps extends Omit<InputProps, "error"> {
  label: string;
  id: string;
  /** Validation message; when present the input shows its error state. */
  error?: string;
  containerClassName?: string;
}

const FormField = ({
  label,
  id,
  error,
  required,
  className,
  containerClassName,
  ...props
}: FormFieldProps) => (
  <div className={cn("space-y-2", containerClassName)}>
    <Label htmlFor={id} required={required}>
      {label}
    </Label>
    <Input
      id={id}
      error={!!error}
      required={required}
      className={className}
      {...props}
    />
    {error && <p className="text-sm font-medium text-red-500">{error}</p>}
  </div>
);
FormField.displayName = "FormField";

export { FormField };
