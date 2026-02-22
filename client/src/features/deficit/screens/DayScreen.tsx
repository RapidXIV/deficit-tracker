import { useState } from "react";
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
import type { UserSettings, DailyLog } from "@shared/schema";

interface DayScreenProps {
  currentDate: string;
  settings: UserSettings;
  stats: DeficitStats;
  logs: DailyLog[];
  caloriesIn: number;
  caloriesOut: number;
  todayDeficit: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onCaloriesInChange: (v: number) => void;
  onCaloriesOutChange: (v: number) => void;
  onFinishDay: () => void;
  onNavigateDate: (date: string) => void;
  onShowHistory: () => void;
  onLogout: () => void;
  onResetGoal: () => Promise<void>;
}

export function DayScreen({
  currentDate,
  settings,
  stats,
  logs,
  caloriesIn,
  caloriesOut,
  todayDeficit,
  onIncrement,
  onDecrement,
  onCaloriesInChange,
  onCaloriesOutChange,
  onFinishDay,
  onNavigateDate,
  onShowHistory,
  onLogout,
  onResetGoal,
}: DayScreenProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  // Live total: replace stored today's deficit with live value
  const storedToday = logs.find((l) => l.date === currentDate);
  const liveTotalDeficit =
    stats.totalDeficitAchieved - (storedToday?.deficit ?? 0) + todayDeficit;

  const totalIsPositive = liveTotalDeficit >= 0;
  const todayIsPositive = todayDeficit >= 0;

  return (
    <div className="h-screen flex flex-col max-w-md mx-auto px-5 overflow-hidden pt-safe pb-safe">
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
        <p className="text-xs uppercase tracking-widest text-muted-foreground text-center mb-1.5">
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
        <p className="text-xs uppercase tracking-widest text-muted-foreground text-center mb-1">
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
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-0.5">
          Today's Deficit
        </p>
        <p
          className={`text-3xl font-bold tabular-nums leading-tight ${
            todayIsPositive ? "text-green-400" : "text-red-400"
          }`}
        >
          {formatDeficit(todayDeficit)}
        </p>
      </div>

      {/* ── Total Deficit ── */}
      <div className="mt-2 flex-shrink-0 border border-white/20 rounded-lg py-2 text-center">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-0.5">
          Total Deficit
        </p>
        <p
          className={`text-4xl font-bold tabular-nums leading-tight ${
            totalIsPositive ? "text-green-400" : "text-red-400"
          }`}
        >
          {formatDeficit(liveTotalDeficit)}
        </p>
      </div>

      {/* Spacer */}
      <div className="flex-1 min-h-0" />

      {/* ── Bottom buttons ── */}
      <div className="flex flex-col gap-1.5 flex-shrink-0 pb-1">
        <Button variant="outline" size="full" onClick={onFinishDay}>
          Finish Day
        </Button>
        <Button variant="default" size="full" onClick={onShowHistory}>
          History
        </Button>
      </div>
    </div>
  );
}
