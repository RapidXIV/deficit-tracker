import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center font-mono font-medium transition-opacity focus-visible:outline-none disabled:opacity-40 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default:
          "border border-white/25 bg-black text-white hover:bg-white/5 active:bg-white/10",
        outline:
          "border border-white bg-black text-white hover:bg-white/5 active:bg-white/10",
        ghost:
          "text-muted-foreground hover:text-white bg-transparent",
        destructive:
          "border border-red-400 text-red-400 hover:bg-red-400/10",
      },
      size: {
        default: "h-10 px-4 rounded-md text-sm",
        sm: "h-8 px-3 rounded-md text-xs",
        lg: "h-11 px-6 rounded-md text-sm",
        icon: "h-9 w-9 rounded-md",
        full: "h-10 w-full rounded-md text-sm",
        counter: "h-14 w-20 rounded-md text-xl",
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
