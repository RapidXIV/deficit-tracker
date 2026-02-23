import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { UserSettings, DailyLog } from "@shared/schema";
import { playComplete } from "@/lib/sounds";

interface UseCalorieTrackingProps {
  date: string;
  dynamicTDEE: number;
  settings: UserSettings | null;
  logs: DailyLog[];
  isLogsLoaded: boolean;
  onDayFinished: () => void;
}

export function useCalorieTracking({
  date,
  dynamicTDEE,
  settings,
  logs,
  isLogsLoaded,
  onDayFinished,
}: UseCalorieTrackingProps) {
  const qc = useQueryClient();
  const [caloriesIn, setCaloriesIn] = useState(0);
  const [caloriesOut, setCaloriesOut] = useState(0);

  // Refs to always have latest values without stale closures
  const cInRef = useRef(0);
  const cOutRef = useRef(0);
  const logsRef = useRef(logs);
  const tdeeRef = useRef(dynamicTDEE);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const revisionRef = useRef(0);

  // Keep refs in sync
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
    async (cIn: number, cOut: number, completed = false) => {
      if (!settings) return;

      const revision = ++revisionRef.current;
      const deficit = Math.round(tdeeRef.current) + cOut - cIn;

      const existing = logsRef.current.find((l) => l.date === date);
      const maxDay =
        logsRef.current.length > 0
          ? Math.max(...logsRef.current.map((l) => l.dayNumber))
          : 0;
      const dayNumber = existing?.dayNumber ?? maxDay + 1;

      try {
        await apiRequest("POST", "/api/logs", {
          date,
          caloriesIn: cIn,
          caloriesOut: cOut,
          deficit,
          dayNumber,
          completed: existing?.completed || completed,
        });
        if (revision === revisionRef.current) {
          qc.invalidateQueries({ queryKey: ["/api/logs"] });
        }
      } catch {
        // silent — user will see stale data but no error popup
      }
    },
    [date, settings, qc]
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

    const optimisticLog: DailyLog = {
      id: existing?.id ?? `optimistic-${date}`,
      userId: existing?.userId ?? "",
      date,
      caloriesIn: cIn,
      caloriesOut: cOut,
      deficit,
      dayNumber,
      completed: true,
    };

    qc.setQueryData<DailyLog[]>(["/api/logs"], (prev = []) => [
      ...prev.filter((l) => l.date !== date),
      optimisticLog,
    ]);

    playComplete();
    onDayFinished();
    save(cIn, cOut, true); // fire-and-forget: server save + real refetch in background
  }, [date, save, onDayFinished, qc]);

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
