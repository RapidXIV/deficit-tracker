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
import { computeLogsWithEstimatedWeights } from "@/lib/calculations";
import type { UserSettings } from "@shared/schema";

export function Home() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { settings, isLoading: settingsLoading, saveSettings, patchGoalWeight } = useSettings();
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

  const logsWithEstWeight = useMemo(
    () =>
      settings
        ? computeLogsWithEstimatedWeights(completedLogs, settings.startWeight)
        : [],
    [settings, completedLogs]
  );

  // Fade out splash once auth (and settings, if authenticated) are done loading
  useEffect(() => {
    if (authLoading) return;
    if (isAuthenticated && settingsLoading) return;
    const splash = document.getElementById('splash');
    if (!splash) return;
    splash.style.opacity = '0';
    splash.addEventListener('transitionend', () => splash.remove(), { once: true });
  }, [authLoading, isAuthenticated, settingsLoading]);

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

  // Auth still loading — splash covers the blank screen
  if (authLoading) return null;

  // Not authenticated → show landing
  if (!isAuthenticated && !authed) {
    return <Landing onAuthenticated={() => setAuthed(true)} />;
  }

  // Settings still loading — splash covers it on initial load; post-login transition is fast
  if (settingsLoading) return null;

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
      onSaveGoalWeight={async (weight) => {
        await patchGoalWeight({ goalWeight: weight });
      }}
      username={user?.username ?? ""}
      onResetGoal={async () => {
        await resetAll();
        stickySetRef.current = false;
        setCurrentDate(todayString());
      }}
    />
  );
}
