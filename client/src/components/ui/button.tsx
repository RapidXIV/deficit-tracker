import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center font-medium focus-visible:outline-none disabled:opacity-40 disabled:pointer-events-none transition-all duration-100",
  {
    variants: {
      variant: {
        // Primary — Finish Day, Sign In, Sign Up
        default:
          "bg-[#e8923a] border-[3px] border-[#1a1a18] text-white uppercase tracking-[0.1em] shadow-[4px_4px_0px_#1a1a18] hover:brightness-105 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#1a1a18]",
        // Secondary — History, Back
        outline:
          "bg-[#e0d6c4] border-[3px] border-[#1a1a18] text-[#1a1a18] uppercase tracking-[0.1em] shadow-[4px_4px_0px_#1a1a18] hover:brightness-95 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#1a1a18]",
        // Ghost — nav icons (logout arrow, settings gear, chevrons)
        ghost:
          "text-[#1a1a18] hover:text-[#3a3830] bg-transparent",
        // Destructive — Reset Goal
        destructive:
          "bg-[#e0d6c4] border-[3px] border-[#1a1a18] text-[#d43030] uppercase tracking-[0.1em] shadow-[4px_4px_0px_#1a1a18] hover:brightness-95 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#1a1a18]",
      },
      size: {
        default: "h-10 px-4 rounded-[var(--radius-md)] text-[12px]",
        sm: "h-8 px-3 rounded-[var(--radius-md)] text-[11px]",
        lg: "h-11 px-6 rounded-[var(--radius-md)] text-[12px]",
        icon: "h-9 w-9 rounded-[var(--radius-md)]",
        full: "h-11 w-full rounded-[var(--radius-md)] text-[12px]",
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
