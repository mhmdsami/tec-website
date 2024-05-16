import * as React from "react";

import { UseFormRegister } from "react-hook-form";
import { Label } from "~/components/ui/label";
import { cn } from "~/utils/helpers";

export interface TextareaPrimitiveProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const TextareaPrimitive = React.forwardRef<
  HTMLTextAreaElement,
  TextareaPrimitiveProps
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
TextareaPrimitive.displayName = "Textarea";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string;
  register?: UseFormRegister<any>;
  label?: string;
  errorMessage?: string;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
}

function Textarea({
  name,
  label,
  placeholder,
  errorMessage,
  register,
  className,
  labelClassName,
  inputClassName,
  ...props
}: TextareaProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label className={labelClassName}>{label}</Label>
      {register ? (
        <TextareaPrimitive
          className={className}
          placeholder={placeholder ?? label}
          {...props}
          {...register(name)}
        />
      ) : (
        <TextareaPrimitive
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
Textarea.displayName = "Textarea";

export { Textarea };
