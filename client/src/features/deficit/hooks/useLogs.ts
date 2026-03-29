import { useState, useCallback } from "react";
import type { DailyLog } from "@shared/schema";

const LS_KEY = "deficit:logs";

function load(): DailyLog[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as DailyLog[]) : [];
  } catch {
    return [];
  }
}

function persist(logs: DailyLog[]): void {
  localStorage.setItem(LS_KEY, JSON.stringify(logs));
}

export function useLogs() {
  const [logs, setLogs] = useState<DailyLog[]>(load);

  const upsertLog = useCallback((data: Omit<DailyLog, "id" | "userId">) => {
    setLogs((prev) => {
      const existing = prev.find((l) => l.date === data.date);
      let next: DailyLog[];
      if (existing) {
        next = prev.map((l) =>
          l.date === data.date ? { ...l, ...data } : l
        );
      } else {
        const newLog: DailyLog = {
          id: crypto.randomUUID(),
          userId: "local",
          ...data,
        };
        next = [...prev, newLog];
      }
      persist(next);
      return next;
    });
  }, []);

  const resetDay = useCallback(async (date: string) => {
    setLogs((prev) => {
      const next = prev.filter((l) => l.date !== date);
      persist(next);
      return next;
    });
  }, []);

  const resetAll = useCallback(async () => {
    persist([]);
    setLogs([]);
  }, []);

  return {
    logs,
    isLogsLoaded: true,
    upsertLog,
    resetDay,
    resetAll,
  };
}
