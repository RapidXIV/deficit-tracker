import { forwardRef } from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/lib/utils";

const Label = forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, style, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      "font-medium uppercase font-mono tracking-[0.08em]",
      className
    )}
    style={{ fontSize: 'var(--type-label)', color: 'var(--text-secondary)', ...style }}
    {...props}
  />
));
Label.displayName = "Label";

export { Label };
