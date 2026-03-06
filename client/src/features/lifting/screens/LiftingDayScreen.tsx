import { ArrowLeft, ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLiftingLog } from "../hooks/useLiftingLog";
import { formatDateNav, addDays, subtractDays } from "@/lib/date-utils";
import type { LiftingExercise } from "@shared/schema";

interface LiftingDayScreenProps {
  currentDate: string;
  onNavigateDate: (date: string) => void;
  onBack: () => void;
  onShowHistory: () => void;
}

export function LiftingDayScreen({
  currentDate,
  onNavigateDate,
  onBack,
  onShowHistory,
}: LiftingDayScreenProps) {
  const { exercises, updateExercises, isComplete, finishDay, totalWork } =
    useLiftingLog(currentDate);

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

  return (
    <div className="h-[100dvh] flex flex-col max-w-md mx-auto px-4 overflow-hidden touch-none pt-safe pb-safe">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between h-9 flex-shrink-0">
        <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigateDate(subtractDays(currentDate, 1))}
            aria-label="Previous day"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs font-mono tabular-nums w-28 text-center">
            {formatDateNav(currentDate)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigateDate(addDays(currentDate, 1))}
            aria-label="Next day"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        {/* Balance left button */}
        <div className="w-9" />
      </div>

      {/* ── Column headers ── */}
      <div className="flex gap-1 items-center mt-2 mb-1 flex-shrink-0">
        <div
          className="flex-1 uppercase tracking-[0.06em] font-medium"
          style={{ fontSize: '9px', color: 'var(--text-secondary)' }}
        >
          Exercise
        </div>
        <div
          className="w-16 text-right uppercase tracking-[0.06em] font-medium"
          style={{ fontSize: '9px', color: 'var(--text-secondary)' }}
        >
          Lbs
        </div>
        <div
          className="w-12 text-right uppercase tracking-[0.06em] font-medium"
          style={{ fontSize: '9px', color: 'var(--text-secondary)' }}
        >
          Sets
        </div>
        <div
          className="w-12 text-right uppercase tracking-[0.06em] font-medium"
          style={{ fontSize: '9px', color: 'var(--text-secondary)' }}
        >
          Reps
        </div>
        <div className="w-6" />
      </div>

      {/* ── Scrollable exercise list ── */}
      <div className="flex-1 overflow-y-auto touch-pan-y">
        <div className="flex flex-col gap-1.5">
          {exercises.map((ex, i) => (
            <div key={i} className="flex gap-1 items-center">
              <Input
                className="flex-1 h-8 text-xs"
                placeholder="Exercise name"
                value={ex.name}
                onChange={(e) => updateExercise(i, "name", e.target.value)}
              />
              <Input
                type="number"
                inputMode="decimal"
                className="w-16 h-8 text-xs text-right"
                placeholder="0"
                value={ex.weight || ""}
                onChange={(e) =>
                  updateExercise(i, "weight", parseFloat(e.target.value) || 0)
                }
              />
              <Input
                type="number"
                inputMode="numeric"
                className="w-12 h-8 text-xs text-right"
                placeholder="0"
                value={ex.sets || ""}
                onChange={(e) =>
                  updateExercise(i, "sets", parseInt(e.target.value, 10) || 0)
                }
              />
              <Input
                type="number"
                inputMode="numeric"
                className="w-12 h-8 text-xs text-right"
                placeholder="0"
                value={ex.reps || ""}
                onChange={(e) =>
                  updateExercise(i, "reps", parseInt(e.target.value, 10) || 0)
                }
              />
              <button
                onClick={() => removeExercise(i)}
                className="w-6 flex items-center justify-center transition-colors"
                style={{ color: 'var(--text-muted)' }}
                aria-label="Remove exercise"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Add Exercise ── */}
      <button
        onClick={addExercise}
        className="flex-shrink-0 flex items-center gap-1 mt-2 transition-colors"
        style={{ color: 'var(--text-muted)', fontSize: '11px' }}
      >
        <Plus className="h-3 w-3" />
        <span className="uppercase tracking-[0.08em]" style={{ fontSize: 'var(--type-label)' }}>
          Add Exercise
        </span>
      </button>

      {/* ── Total Work ── */}
      <div className="flex-shrink-0 mt-3 text-center">
        <p
          className="font-medium uppercase tracking-[0.08em] mb-1"
          style={{ fontSize: 'var(--type-label)', color: 'var(--text-secondary)' }}
        >
          Total Work
        </p>
        <p
          className="font-bold tabular-nums leading-tight tracking-[-0.02em]"
          style={{ fontSize: 'var(--type-stat)', color: 'var(--accent-positive)' }}
        >
          +{Math.round(totalWork).toLocaleString()} J
        </p>
      </div>

      {/* Spacer */}
      <div className="flex-shrink-0 min-h-0 mt-2" />

      {/* ── Bottom buttons ── */}
      <div className="flex flex-col gap-1.5 flex-shrink-0 pb-1">
        {!isComplete && (
          <Button variant="default" size="full" onClick={finishDay}>
            Finish Day
          </Button>
        )}
        <Button variant="outline" size="full" onClick={onShowHistory}>
          Lifting History
        </Button>
      </div>
    </div>
  );
}
