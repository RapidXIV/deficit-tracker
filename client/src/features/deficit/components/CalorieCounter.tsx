import { useRef } from "react";
import { Minus, Plus } from "lucide-react";

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
    <div className="flex items-center justify-center gap-3">
      <button className="tally-btn" onClick={onDecrement} aria-label="Decrease by 100">
        <Minus className="h-5 w-5" />
      </button>

      <input
        ref={inputRef}
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)}
        onFocus={() => inputRef.current?.select()}
        className="counter-display"
      />

      <button className="tally-btn" onClick={onIncrement} aria-label="Increase by 100">
        <Plus className="h-5 w-5" />
      </button>
    </div>
  );
}
