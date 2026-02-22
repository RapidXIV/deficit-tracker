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
        "flex h-9 w-full rounded-md border border-white/25 bg-black px-3 py-1",
        "text-white font-mono text-sm",
        "placeholder:text-muted-foreground",
        "focus:outline-none focus:border-white",
        "disabled:opacity-40",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
