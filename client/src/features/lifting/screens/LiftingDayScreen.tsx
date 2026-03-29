import { ArrowLeft, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLiftingTemplate } from "../hooks/useLiftingTemplate";
import { useLiftingEntries } from "../hooks/useLiftingEntries";
import type { LiftingExercise } from "@shared/schema";

interface LiftingDayScreenProps {
  onBack: () => void;
  onShowHistory: () => void;
}

export function LiftingDayScreen({ onBack, onShowHistory }: LiftingDayScreenProps) {
  const { exercises, updateExercises } = useLiftingTemplate();
  const { prMap, addEntry } = useLiftingEntries();

  function updateExercise(
    i: number,
    field: keyof LiftingExercise,
    value: string | number
  ) {
    updateExercises(
      exercises.map((ex, idx) => (idx === i ? { ...ex, [field]: value } : ex))
    );
  }

  function addExercise() {
    updateExercises([...exercises, { name: "", weight: 0, sets: 0, reps: 0 }]);
  }

  function removeExercise(i: number) {
    const next = exercises.filter((_, idx) => idx !== i);
    updateExercises(next.length > 0 ? next : [{ name: "", weight: 0, sets: 0, reps: 0 }]);
  }

  async function handleAdd(i: number) {
    const ex = exercises[i];
    if (!ex.name.trim()) return;
    await addEntry({
      exerciseName: ex.name.trim(),
      weight: ex.weight,
      sets: ex.sets,
      reps: ex.reps,
    });
  }

  const labelStyle = { fontSize: '9px', color: 'var(--text-secondary)' };

  return (
    <div className="h-[100dvh] flex flex-col max-w-md mx-auto px-4 overflow-hidden touch-none pt-safe pb-safe">
      {/* ── Top bar ── */}
      <div className="flex items-center h-9 flex-shrink-0">
        <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1
          className="flex-1 text-center uppercase tracking-[0.08em] font-medium pr-9"
          style={{ fontSize: 'var(--type-label)', color: 'var(--text-secondary)' }}
        >
          Lifting
        </h1>
      </div>

      {/* ── Column headers ── */}
      <div className="flex gap-0.5 items-center mt-2 mb-1 flex-shrink-0">
        <div className="w-12" /> {/* Add button column */}
        <div className="flex-1 uppercase tracking-[0.06em] font-medium" style={labelStyle}>
          Exercise
        </div>
        <div className="w-14 text-right uppercase tracking-[0.06em] font-medium" style={labelStyle}>
          Lbs
        </div>
        <div className="w-9 text-right uppercase tracking-[0.06em] font-medium" style={labelStyle}>
          Sets
        </div>
        <div className="w-9 text-right uppercase tracking-[0.06em] font-medium" style={labelStyle}>
          Reps
        </div>
        <div className="w-10 text-right uppercase tracking-[0.06em] font-medium" style={labelStyle}>
          PR
        </div>
        <div className="w-5" />
      </div>

      {/* ── Scrollable exercise list ── */}
      <div className="flex-1 overflow-y-auto touch-pan-y">
        <div className="flex flex-col gap-1.5">
          {exercises.map((ex, i) => {
            const pr = ex.name.trim() ? prMap[ex.name.trim()] : undefined;
            return (
              <div key={i} className="flex gap-0.5 items-center">
                {/* Add button — leftmost */}
                <Button
                  variant="default"
                  size="sm"
                  className="w-12 h-8 px-0 text-xs flex-shrink-0"
                  onClick={() => handleAdd(i)}
                  disabled={!ex.name.trim()}
                >
                  Add
                </Button>
                <Input
                  className="flex-1 h-8 text-xs px-2"
                  placeholder="Exercise"
                  value={ex.name}
                  onChange={(e) => updateExercise(i, "name", e.target.value)}
                />
                <Input
                  type="number"
                  inputMode="decimal"
                  className="w-14 h-8 text-xs text-right px-1"
                  placeholder="0"
                  value={ex.weight || ""}
                  onChange={(e) =>
                    updateExercise(i, "weight", parseFloat(e.target.value) || 0)
                  }
                />
                <Input
                  type="number"
                  inputMode="numeric"
                  className="w-9 h-8 text-xs text-center px-1"
                  placeholder="0"
                  value={ex.sets || ""}
                  onChange={(e) =>
                    updateExercise(i, "sets", parseInt(e.target.value, 10) || 0)
                  }
                />
                <Input
                  type="number"
                  inputMode="numeric"
                  className="w-9 h-8 text-xs text-center px-1"
                  placeholder="0"
                  value={ex.reps || ""}
                  onChange={(e) =>
                    updateExercise(i, "reps", parseInt(e.target.value, 10) || 0)
                  }
                />
                {/* PR badge */}
                <div
                  className="w-10 text-right tabular-nums flex-shrink-0"
                  style={{ fontSize: '9px', color: 'var(--text-muted)' }}
                >
                  {pr !== undefined ? `${pr}` : "—"}
                </div>
                <button
                  onClick={() => removeExercise(i)}
                  className="w-5 flex items-center justify-center transition-colors flex-shrink-0"
                  style={{ color: 'var(--text-muted)' }}
                  aria-label="Remove exercise"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Add Exercise ── */}
      <button
        onClick={addExercise}
        className="flex-shrink-0 flex items-center gap-1 mt-2 transition-colors"
        style={{ color: 'var(--text-muted)' }}
      >
        <Plus className="h-3 w-3" />
        <span className="uppercase tracking-[0.08em]" style={{ fontSize: 'var(--type-label)' }}>
          Add Exercise
        </span>
      </button>

      {/* ── Bottom button ── */}
      <div className="flex flex-col gap-1.5 flex-shrink-0 mt-3 pb-1">
        <Button variant="outline" size="full" onClick={onShowHistory}>
          Lifting History
        </Button>
      </div>
    </div>
  );
}
