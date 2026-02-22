import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center font-mono font-medium focus-visible:outline-none disabled:opacity-40 disabled:pointer-events-none transition-all duration-100",
  {
    variants: {
      variant: {
        // Primary — Finish Day, Sign In, Sign Up, Log Out (settings)
        default:
          "bg-[var(--surface-2)] border border-[var(--border-medium)] text-[var(--text-primary)] uppercase tracking-[0.1em] hover:bg-[var(--surface-3)] hover:border-[var(--border-focus)] active:scale-[0.98]",
        // Secondary — History, Log Out (settings), Back
        outline:
          "bg-transparent border border-[var(--border-subtle)] text-[var(--text-primary)] uppercase tracking-[0.1em] hover:border-[var(--border-medium)] active:scale-[0.98]",
        // Ghost — nav icons (logout arrow, settings gear, chevrons)
        ghost:
          "text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-transparent",
        // Destructive — Reset Goal
        destructive:
          "bg-[var(--surface-2)] border border-[var(--border-medium)] text-[var(--accent-negative)] uppercase tracking-[0.1em] hover:bg-[var(--surface-3)] hover:border-[rgba(255,59,59,0.4)] active:scale-[0.98]",
      },
      size: {
        default: "h-10 px-4 rounded-[var(--radius-sm)] text-[12px]",
        sm: "h-8 px-3 rounded-[var(--radius-sm)] text-[11px]",
        lg: "h-11 px-6 rounded-[var(--radius-sm)] text-[12px]",
        icon: "h-9 w-9 rounded-[var(--radius-sm)]",
        full: "h-11 w-full rounded-[var(--radius-sm)] text-[12px]",
        counter: "h-14 w-20 rounded-[var(--radius-md)] text-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
