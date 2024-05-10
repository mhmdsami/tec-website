import * as React from "react";

import { UseFormRegister } from "react-hook-form";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";

export interface InputPrimitiveProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const InputPrimitive = React.forwardRef<HTMLInputElement, InputPrimitiveProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
InputPrimitive.displayName = "Input";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  register?: UseFormRegister<any>;
  label?: string;
  errorMessage?: string;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
}

function Input({
  name,
  label,
  placeholder,
  errorMessage,
  register,
  className,
  labelClassName,
  inputClassName,
  ...props
}: InputProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && <Label className={labelClassName}>{label}</Label>}
      {register ? (
        <InputPrimitive
          className={className}
          placeholder={placeholder ?? label}
          {...props}
          {...register(name)}
        />
      ) : (
        <InputPrimitive
          className={className}
          placeholder={placeholder ?? label}
          {...props}
        />
      )}
      <p
        className={cn(
          "hidden text-sm text-destructive",
          errorMessage && "block",
        )}
      >
        {errorMessage}
      </p>
    </div>
  );
}
Input.displayName = "Input";

export { Input, InputPrimitive };
