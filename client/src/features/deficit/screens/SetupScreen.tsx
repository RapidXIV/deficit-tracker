import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { UserSettings } from "@shared/schema";

interface SetupScreenProps {
  onComplete: (data: Omit<UserSettings, "id" | "userId">) => Promise<void>;
}

export function SetupScreen({ onComplete }: SetupScreenProps) {
  const [goalWeight, setGoalWeight] = useState("");
  const [startWeight, setStartWeight] = useState("");
  const [age, setAge] = useState("");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [sex, setSex] = useState<"male" | "female">("male");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const gw = parseFloat(goalWeight);
    const sw = parseFloat(startWeight);
    const ag = parseInt(age, 10);
    const ft = parseInt(heightFt, 10);
    const inch = parseInt(heightIn, 10);

    if (!gw || !sw || !ag || !ft || isNaN(inch)) {
      setError("Please fill in all fields.");
      return;
    }
    if (gw >= sw) {
      setError("Goal weight must be less than current weight.");
      return;
    }

    setSubmitting(true);
    try {
      await onComplete({
        goalWeight: gw,
        startWeight: sw,
        age: ag,
        sex,
        heightFt: ft,
        heightIn: inch,
      });
    } catch {
      setError("Failed to save. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="h-screen flex flex-col max-w-md mx-auto px-4 overflow-hidden pt-safe pb-safe" style={{ background: 'var(--surface-0)' }}>
      <h1
        className="text-center font-bold uppercase mb-6"
        style={{ fontSize: 'var(--type-label)', color: 'var(--text-secondary)', letterSpacing: '0.12em' }}
      >
        Deficit Tracker
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 flex-1">
        {/* Goal weight */}
        <div className="flex flex-col gap-1">
          <Label htmlFor="goal-weight">Goal (lbs)</Label>
          <Input
            id="goal-weight"
            type="number"
            inputMode="decimal"
            placeholder="180"
            value={goalWeight}
            onChange={(e) => setGoalWeight(e.target.value)}
            className="h-8"
          />
        </div>

        {/* Current weight */}
        <div className="flex flex-col gap-1">
          <Label htmlFor="start-weight">Current (lbs)</Label>
          <Input
            id="start-weight"
            type="number"
            inputMode="decimal"
            placeholder="210"
            value={startWeight}
            onChange={(e) => setStartWeight(e.target.value)}
            className="h-8"
          />
        </div>

        {/* Age */}
        <div className="flex flex-col gap-1">
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            type="number"
            inputMode="numeric"
            placeholder="30"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="h-8"
          />
        </div>

        {/* Height */}
        <div className="flex flex-col gap-1">
          <Label>Height</Label>
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              inputMode="numeric"
              placeholder="5"
              value={heightFt}
              onChange={(e) => setHeightFt(e.target.value)}
              className="w-20 h-8"
            />
            <span className="font-medium uppercase" style={{ fontSize: 'var(--type-label)', color: 'var(--text-secondary)', letterSpacing: '0.08em' }}>ft</span>
            <Input
              type="number"
              inputMode="numeric"
              placeholder="10"
              value={heightIn}
              onChange={(e) => setHeightIn(e.target.value)}
              className="w-20 h-8"
            />
            <span className="font-medium uppercase" style={{ fontSize: 'var(--type-label)', color: 'var(--text-secondary)', letterSpacing: '0.08em' }}>in</span>
          </div>
        </div>

        {/* Sex */}
        <div className="flex flex-col gap-1.5">
          <Label>Sex</Label>
          <RadioGroup
            value={sex}
            onValueChange={(v) => setSex(v as "male" | "female")}
          >
            <RadioGroupItem value="male">M</RadioGroupItem>
            <RadioGroupItem value="female">F</RadioGroupItem>
          </RadioGroup>
        </div>

        {error && (
          <p className="text-xs" style={{ color: 'var(--accent-negative)' }}>{error}</p>
        )}

        <div className="flex-1" />

        <Button
          type="submit"
          variant="default"
          size="full"
          disabled={submitting}
        >
          {submitting ? "Saving..." : "Start Tracking"}
        </Button>
      </form>
    </div>
  );
}
