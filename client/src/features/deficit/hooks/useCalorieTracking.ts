import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import type { UserSettings, DailyLog } from "@shared/schema";
import { playGong } from "@/lib/sounds";

interface UseCalorieTrackingProps {
  date: string;
  dynamicTDEE: number;
  settings: UserSettings | null;
  logs: DailyLog[];
  isLogsLoaded: boolean;
  upsertLog: (data: Omit<DailyLog, "id" | "userId">) => void;
  onDayFinished: () => void;
}

export function useCalorieTracking({
  date,
  dynamicTDEE,
  settings,
  logs,
  isLogsLoaded,
  upsertLog,
  onDayFinished,
}: UseCalorieTrackingProps) {
  const [caloriesIn, setCaloriesIn] = useState(0);
  const [caloriesOut, setCaloriesOut] = useState(0);

  const cInRef = useRef(0);
  const cOutRef = useRef(0);
  const logsRef = useRef(logs);
  const tdeeRef = useRef(dynamicTDEE);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useLayoutEffect(() => {
    logsRef.current = logs;
  });
  useEffect(() => {
    tdeeRef.current = dynamicTDEE;
  }, [dynamicTDEE]);

  // Sync local state when date changes or logs first load.
  // Does NOT trigger autosave — only user interactions do.
  useEffect(() => {
    clearTimeout(debounceRef.current);
    const existing = logsRef.current.find((l) => l.date === date);
    const cIn = existing?.caloriesIn ?? 0;
    const cOut = existing?.caloriesOut ?? 0;
    cInRef.current = cIn;
    cOutRef.current = cOut;
    setCaloriesIn(cIn);
    setCaloriesOut(cOut);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, isLogsLoaded]);

  const save = useCallback(
    (cIn: number, cOut: number, completed = false) => {
      if (!settings) return;

      const deficit = Math.round(tdeeRef.current) + cOut - cIn;
      const existing = logsRef.current.find((l) => l.date === date);
      const maxDay =
        logsRef.current.length > 0
          ? Math.max(...logsRef.current.map((l) => l.dayNumber))
          : 0;
      const dayNumber = existing?.dayNumber ?? maxDay + 1;

      upsertLog({
        date,
        caloriesIn: cIn,
        caloriesOut: cOut,
        deficit,
        dayNumber,
        completed: existing?.completed || completed,
      });
    },
    [date, settings, upsertLog]
  );

  const debouncedSave = useCallback(
    (cIn: number, cOut: number) => {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => save(cIn, cOut), 500);
    },
    [save]
  );

  const increment = useCallback(() => {
    const next = cInRef.current + 100;
    cInRef.current = next;
    setCaloriesIn(next);
    debouncedSave(next, cOutRef.current);
  }, [debouncedSave]);

  const decrement = useCallback(() => {
    const next = Math.max(0, cInRef.current - 100);
    cInRef.current = next;
    setCaloriesIn(next);
    debouncedSave(next, cOutRef.current);
  }, [debouncedSave]);

  const updateCaloriesIn = useCallback(
    (value: number) => {
      const v = Math.max(0, isNaN(value) ? 0 : value);
      cInRef.current = v;
      setCaloriesIn(v);
      debouncedSave(v, cOutRef.current);
    },
    [debouncedSave]
  );

  const updateCaloriesOut = useCallback(
    (value: number) => {
      const v = Math.max(0, isNaN(value) ? 0 : value);
      cOutRef.current = v;
      setCaloriesOut(v);
      debouncedSave(cInRef.current, v);
    },
    [debouncedSave]
  );

  const finishDay = useCallback(() => {
    clearTimeout(debounceRef.current);

    const cIn = cInRef.current;
    const cOut = cOutRef.current;
    const deficit = Math.round(tdeeRef.current) + cOut - cIn;

    const existing = logsRef.current.find((l) => l.date === date);
    const maxDay =
      logsRef.current.length > 0
        ? Math.max(...logsRef.current.map((l) => l.dayNumber))
        : 0;
    const dayNumber = existing?.dayNumber ?? maxDay + 1;

    upsertLog({
      date,
      caloriesIn: cIn,
      caloriesOut: cOut,
      deficit,
      dayNumber,
      completed: true,
    });

    playGong();
    onDayFinished();
  }, [date, upsertLog, onDayFinished]);

  const todayDeficit =
    Math.round(dynamicTDEE) + caloriesOut - caloriesIn;

  return {
    caloriesIn,
    caloriesOut,
    todayDeficit,
    increment,
    decrement,
    updateCaloriesIn,
    updateCaloriesOut,
    finishDay,
  };
}
