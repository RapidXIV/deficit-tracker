import { useState, useRef, useEffect } from "react";
import { LogOut, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ProgressCard } from "../components/ProgressCard";
import { CalorieCounter } from "../components/CalorieCounter";
import { formatDateNav, formatDeficit } from "@/lib/date-utils";
import { addDays, subtractDays } from "@/lib/date-utils";
import type { DeficitStats } from "@/lib/calculations";
import type { UserSettings } from "@shared/schema";

interface DayScreenProps {
  currentDate: string;
  settings: UserSettings;
  stats: DeficitStats;
  caloriesIn: number;
  caloriesOut: number;
  todayDeficit: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onCaloriesInChange: (v: number) => void;
  onCaloriesOutChange: (v: number) => void;
  onFinishDay: () => void;
  isCurrentDayCompleted: boolean;
  onNavigateDate: (date: string) => void;
  onShowHistory: () => void;
  onLogout: () => void;
  onResetGoal: () => Promise<void>;
  onSaveGoalWeight: (weight: number) => Promise<void>;
}

export function DayScreen({
  currentDate,
  settings,
  stats,
  caloriesIn,
  caloriesOut,
  todayDeficit,
  onIncrement,
  onDecrement,
  onCaloriesInChange,
  onCaloriesOutChange,
  onFinishDay,
  isCurrentDayCompleted,
  onNavigateDate,
  onShowHistory,
  onLogout,
  onResetGoal,
  onSaveGoalWeight,
}: DayScreenProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [goalWeightInput, setGoalWeightInput] = useState(
    String(settings.goalWeight)
  );
  useEffect(() => {
    setGoalWeightInput(String(settings.goalWeight));
  }, [settings.goalWeight]);

  // Deficit flash: increment key on every change after initial mount so the
  // CSS animation restarts from scratch (key change forces DOM remount)
  const isFirstRender = useRef(true);
  const [flashKey, setFlashKey] = useState(0);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    setFlashKey(k => k + 1);
  }, [todayDeficit]);

  const todayColor =
    todayDeficit > 0 ? 'var(--accent-positive)' :
    todayDeficit < 0 ? 'var(--accent-negative)' :
    'var(--text-muted)';
  const totalColor =
    stats.totalDeficitAchieved > 0 ? 'var(--accent-positive)' :
    stats.totalDeficitAchieved < 0 ? 'var(--accent-negative)' :
    'var(--text-muted)';

  return (
    <div className="h-[100dvh] flex flex-col max-w-md mx-auto px-4 overflow-hidden touch-none pt-safe pb-safe">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between h-9 flex-shrink-0">
        <Button variant="ghost" size="icon" onClick={onLogout} aria-label="Log out">
          <LogOut className="h-4 w-4" />
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

        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Settings">
              <Settings className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Settings</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-2 mt-2">
              {/* Goal Weight Editor */}
              <div className="flex flex-col gap-1.5">
                <p
                  className="font-medium uppercase tracking-[0.08em]"
                  style={{ fontSize: 'var(--type-label)', color: 'var(--text-secondary)' }}
                >
                  Goal (lbs)
                </p>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={goalWeightInput}
                  onChange={(e) => setGoalWeightInput(e.target.value)}
                  className="text-center text-sm"
                />
                <Button
                  variant="default"
                  size="full"
                  onClick={async () => {
                    const w = parseFloat(goalWeightInput);
                    if (!isNaN(w) && w > 0) {
                      await onSaveGoalWeight(w);
                    }
                  }}
                >
                  Save
                </Button>
              </div>

              {/* Reset Goal */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="full">
                    Reset Goal
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reset Goal?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This deletes all logs and resets your progress. This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogAction
                      onClick={async () => {
                        await onResetGoal();
                        setSettingsOpen(false);
                      }}
                    >
                      Yes, Reset Everything
                    </AlertDialogAction>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button
                variant="outline"
                size="full"
                onClick={() => {
                  setSettingsOpen(false);
                  onLogout();
                }}
              >
                Log Out
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* ── Progress card ── */}
      <div className="mt-1.5 flex-shrink-0">
        <ProgressCard stats={stats} settings={settings} />
      </div>

      {/* ── Calories In ── */}
      <div className="mt-2 flex-shrink-0">
        <p
          className="font-medium uppercase tracking-[0.08em] text-center mb-1"
          style={{ fontSize: 'var(--type-label)', color: 'var(--text-secondary)' }}
        >
          Calories In
        </p>
        <CalorieCounter
          value={caloriesIn}
          onChange={onCaloriesInChange}
          onIncrement={onIncrement}
          onDecrement={onDecrement}
        />
      </div>

      {/* ── Calories Out ── */}
      <div className="mt-2 flex-shrink-0">
        <p
          className="font-medium uppercase tracking-[0.08em] text-center mb-1"
          style={{ fontSize: 'var(--type-label)', color: 'var(--text-secondary)' }}
        >
          Calories Out
        </p>
        <Input
          type="number"
          inputMode="numeric"
          value={caloriesOut || ""}
          placeholder="0"
          onChange={(e) => onCaloriesOutChange(parseInt(e.target.value, 10) || 0)}
          className="text-center text-sm"
        />
      </div>

      {/* ── Today's Deficit ── */}
      <div className="mt-2 flex-shrink-0 text-center">
        <p
          className="font-medium uppercase tracking-[0.08em] mb-1"
          style={{ fontSize: 'var(--type-label)', color: 'var(--text-secondary)' }}
        >
          Today's Deficit
        </p>
        <p
          key={flashKey}
          className={`font-bold tabular-nums leading-tight tracking-[-0.02em]${flashKey > 0 ? ' deficit-flash' : ''}`}
          style={{ fontSize: 'var(--type-stat)', color: todayColor }}
        >
          {formatDeficit(todayDeficit)}
        </p>
      </div>

      {/* ── Total Deficit ── */}
      <div
        className="mt-2 flex-shrink-0 p-4 text-center"
        style={{
          background: 'var(--surface-1)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <p
          className="font-medium uppercase tracking-[0.08em]"
          style={{ fontSize: 'var(--type-label)', color: 'var(--text-secondary)' }}
        >
          Total Deficit
        </p>
        {/* Micro-detail: 40px hairline rule — adds gravitas */}
        <div className="w-10 h-px mx-auto my-2" style={{ background: 'var(--border-medium)' }} />
        <p
          className="font-bold tabular-nums leading-tight tracking-[-0.02em]"
          style={{
            fontSize: 'var(--type-display)',
            color: totalColor,
          }}
        >
          {formatDeficit(stats.totalDeficitAchieved)}
        </p>
      </div>

      {/* Spacer */}
      <div className="flex-1 min-h-0" />

      {/* ── Bottom buttons ── */}
      <div className="flex flex-col gap-1.5 flex-shrink-0 pb-1">
        <Button variant="default" size="full" onClick={onFinishDay}>
          {isCurrentDayCompleted ? "Update Day" : "Finish Day"}
        </Button>
        <Button variant="outline" size="full" onClick={onShowHistory}>
          History
        </Button>
      </div>
    </div>
  );
}
