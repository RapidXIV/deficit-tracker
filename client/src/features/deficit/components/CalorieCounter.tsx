import { useRef } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CalorieCounterProps {
  value: number;
  onChange: (value: number) => void;
  onIncrement: () => void;
  onDecrement: () => void;
}

export function CalorieCounter({
  value,
  onChange,
  onIncrement,
  onDecrement,
}: CalorieCounterProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="default"
        size="counter"
        onClick={onDecrement}
        aria-label="Decrease by 100"
      >
        <Minus className="h-5 w-5" />
      </Button>

      <input
        ref={inputRef}
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)}
        onFocus={() => inputRef.current?.select()}
        className={cn(
          "w-28 text-center bg-transparent text-white font-mono font-bold",
          "text-4xl tabular-nums",
          "border-none outline-none focus:outline-none",
          "leading-none"
        )}
        style={{ fontSize: "2.25rem" }}
      />

      <Button
        variant="default"
        size="counter"
        onClick={onIncrement}
        aria-label="Increase by 100"
      >
        <Plus className="h-5 w-5" />
      </Button>
    </div>
  );
}
