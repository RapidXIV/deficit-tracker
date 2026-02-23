import { useState, useEffect, useRef, useMemo } from "react";
import { useAuth, useLogout } from "@/hooks/use-auth";
import { useSettings } from "@/features/deficit/hooks/useSettings";
import { useLogs } from "@/features/deficit/hooks/useLogs";
import { useDeficitStats } from "@/features/deficit/hooks/useDeficitStats";
import { useCalorieTracking } from "@/features/deficit/hooks/useCalorieTracking";
import { SetupScreen } from "@/features/deficit/screens/SetupScreen";
import { DayScreen } from "@/features/deficit/screens/DayScreen";
import { LogScreen } from "@/features/deficit/screens/LogScreen";
import { Landing } from "./landing";
import { todayString, addDays } from "@/lib/date-utils";
import { isGuestMode } from "@/lib/queryClient";
import { computeLogsWithEstimatedWeights } from "@/lib/calculations";
import type { UserSettings } from "@shared/schema";

export function Home() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { settings, saveSettings } = useSettings();
  const { logs, isLogsLoaded, resetDay, resetAll } = useLogs();
  const logout = useLogout();

  const [authed, setAuthed] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [currentDate, setCurrentDate] = useState(todayString());

  // Stats exclude the current in-progress day — only days completed via Finish Day count.
  // This prevents an inflated deficit (TDEE with 0 calories in) from affecting the
  // ProgressCard before the user has finished logging for the day.
  const completedLogs = useMemo(
    () => logs.filter((l) => l.completed === true),
    [logs]
  );
  const { stats, dynamicTDEE } = useDeficitStats(settings, completedLogs);

  const isCurrentDayCompleted = useMemo(
    () => logs.some((l) => l.date === currentDate && l.completed),
    [logs, currentDate]
  );

  // Log history shows all logs including today's autosaved entry
  const logsWithEstWeight = useMemo(
    () =>
      settings
        ? computeLogsWithEstimatedWeights(logs, settings.startWeight)
        : [],
    [settings, logs]
  );

  // Sticky day: once logs load, jump to the most recent logged date
  const stickySetRef = useRef(false);
  useEffect(() => {
    if (!isLogsLoaded || stickySetRef.current) return;
    stickySetRef.current = true;
    if (logs.length > 0) {
      const mostRecent = [...logs].sort((a, b) =>
        b.date.localeCompare(a.date)
      )[0].date;
      setCurrentDate(mostRecent);
    }
  }, [isLogsLoaded, logs]);

  const {
    caloriesIn,
    caloriesOut,
    todayDeficit,
    increment,
    decrement,
    updateCaloriesIn,
    updateCaloriesOut,
    finishDay,
  } = useCalorieTracking({
    date: currentDate,
    dynamicTDEE,
    settings,
    logs,
    isLogsLoaded,
    onDayFinished: () => setCurrentDate(addDays(currentDate, 1)),
  });

  // Show auth loading spinner
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <span className="text-xs text-muted-foreground uppercase tracking-widest">
          Loading...
        </span>
      </div>
    );
  }

  // Not authenticated and not guest mode
  const isGuest = isGuestMode();
  if (!isAuthenticated && !isGuest && !authed) {
    return <Landing onAuthenticated={() => setAuthed(true)} />;
  }

  // No settings yet → setup
  if (!settings) {
    return (
      <SetupScreen
        onComplete={async (data: Omit<UserSettings, "id" | "userId">) => {
          await saveSettings(data);
        }}
      />
    );
  }

  // History screen
  if (showLog) {
    return (
      <LogScreen
        logsWithEstWeight={logsWithEstWeight}
        onBack={() => setShowLog(false)}
        onDeleteDay={resetDay}
      />
    );
  }

  // Main day screen
  return (
    <DayScreen
      currentDate={currentDate}
      settings={settings}
      stats={stats}
      caloriesIn={caloriesIn}
      caloriesOut={caloriesOut}
      todayDeficit={todayDeficit}
      onIncrement={increment}
      onDecrement={decrement}
      onCaloriesInChange={updateCaloriesIn}
      onCaloriesOutChange={updateCaloriesOut}
      onFinishDay={finishDay}
      isCurrentDayCompleted={isCurrentDayCompleted}
      onNavigateDate={setCurrentDate}
      onShowHistory={() => setShowLog(true)}
      onLogout={async () => {
        await logout.mutateAsync();
        setAuthed(false);
        stickySetRef.current = false;
        setCurrentDate(todayString());
      }}
      onResetGoal={async () => {
        await resetAll();
        stickySetRef.current = false;
        setCurrentDate(todayString());
      }}
    />
  );
}
