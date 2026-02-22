import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-9 w-full px-3 py-1 font-mono",
        "rounded-[var(--radius-sm)]",
        "border border-[var(--border-medium)]",
        "bg-[var(--surface-1)] text-[var(--text-primary)]",
        "placeholder:text-[var(--text-muted)]",
        "focus:outline-none focus:border-[var(--border-focus)]",
        "transition-colors duration-150",
        "disabled:opacity-40",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
