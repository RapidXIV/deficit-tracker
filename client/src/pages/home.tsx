import { useState, useEffect, useRef, useMemo } from "react";
import { useSettings } from "@/features/deficit/hooks/useSettings";
import { useLogs } from "@/features/deficit/hooks/useLogs";
import { useDeficitStats } from "@/features/deficit/hooks/useDeficitStats";
import { useCalorieTracking } from "@/features/deficit/hooks/useCalorieTracking";
import { ImportScreen } from "@/features/deficit/screens/ImportScreen";
import { SetupScreen } from "@/features/deficit/screens/SetupScreen";
import { DayScreen } from "@/features/deficit/screens/DayScreen";
import { LogScreen } from "@/features/deficit/screens/LogScreen";
import { LiftingDayScreen } from "@/features/lifting/screens/LiftingDayScreen";
import { LiftingLogScreen } from "@/features/lifting/screens/LiftingLogScreen";
import { todayString, addDays } from "@/lib/date-utils";
import { computeLogsWithEstimatedWeights } from "@/lib/calculations";
import type { UserSettings } from "@shared/schema";

export function Home() {
  // Show import screen on very first launch (no settings in localStorage yet)
  const [showImport, setShowImport] = useState(
    () => !localStorage.getItem("deficit:settings")
  );

  const { settings, isLoading: settingsLoading, saveSettings, patchGoalWeight } = useSettings();
  const { logs, isLogsLoaded, upsertLog, resetDay, resetAll } = useLogs();

  const [showLog, setShowLog] = useState(false);
  const [showLifting, setShowLifting] = useState(false);
  const [showLiftingLog, setShowLiftingLog] = useState(false);
  const [currentDate, setCurrentDate] = useState(todayString());

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
    upsertLog,
    onDayFinished: () => setCurrentDate(addDays(currentDate, 1)),
  });

  // First launch with no data → import or start fresh
  if (showImport) {
    return <ImportScreen onStartFresh={() => setShowImport(false)} />;
  }

  // Settings still loading
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

  // Lifting history screen
  if (showLifting && showLiftingLog) {
    return <LiftingLogScreen onBack={() => setShowLiftingLog(false)} />;
  }

  // Lifting day screen
  if (showLifting) {
    return (
      <LiftingDayScreen
        onBack={() => setShowLifting(false)}
        onShowHistory={() => setShowLiftingLog(true)}
      />
    );
  }

  // Deficit history screen
  if (showLog) {
    return (
      <LogScreen
        logsWithEstWeight={logsWithEstWeight}
        onBack={() => setShowLog(false)}
        onDeleteDay={async (date) => {
          await resetDay(date);
        }}
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
      onShowLifting={() => setShowLifting(true)}
      onSaveGoalWeight={async (weight) => {
        await patchGoalWeight({ goalWeight: weight });
      }}
      onResetGoal={async () => {
        await resetAll();
        stickySetRef.current = false;
        setCurrentDate(todayString());
      }}
    />
  );
}
