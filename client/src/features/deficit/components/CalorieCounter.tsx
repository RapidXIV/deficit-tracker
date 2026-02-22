import { useRef, useState } from "react";
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

  // Momentum indicator: font-weight bumps 700→800 after 3+ taps within 1s
  const tapTimes = useRef<number[]>([]);
  const [momentum, setMomentum] = useState(false);
  const momentumTimer = useRef<ReturnType<typeof setTimeout>>();

  function handleTap(callback: () => void) {
    callback();
    const now = Date.now();
    tapTimes.current = [...tapTimes.current, now].filter(t => now - t < 1000);
    if (tapTimes.current.length >= 3) {
      setMomentum(true);
      clearTimeout(momentumTimer.current);
      momentumTimer.current = setTimeout(() => setMomentum(false), 500);
    }
  }

  return (
    <div className="flex items-center justify-center gap-3">
      <button className="tally-btn" onClick={() => handleTap(onDecrement)} aria-label="Decrease by 100">
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
        style={momentum ? { fontWeight: 800 } : undefined}
      />

      <button className="tally-btn" onClick={() => handleTap(onIncrement)} aria-label="Increase by 100">
        <Plus className="h-5 w-5" />
      </button>
    </div>
  );
}
