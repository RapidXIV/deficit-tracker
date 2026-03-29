import { useState, useCallback, useMemo } from "react";
import type { LiftingEntry } from "@shared/schema";

const LS_KEY = "deficit:lifting:entries";

// totalWork in Joules: weight(lbs → kg) × gravity × 0.5m height × sets × reps
function computeTotalWork(weight: number, sets: number, reps: number): number {
  return (weight / 2.205) * 9.81 * 0.5 * sets * reps;
}

function load(): LiftingEntry[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as LiftingEntry[]) : [];
  } catch {
    return [];
  }
}

function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function useLiftingEntries() {
  const [entries, setEntries] = useState<LiftingEntry[]>(load);

  const prMap = useMemo<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    for (const entry of entries) {
      const current = map[entry.exerciseName];
      if (current === undefined || entry.weight > current) {
        map[entry.exerciseName] = entry.weight;
      }
    }
    return map;
  }, [entries]);

  const addEntry = useCallback(
    async (data: {
      exerciseName: string;
      weight: number;
      sets: number;
      reps: number;
    }) => {
      setEntries((prev) => {
        const maxId = prev.length > 0 ? Math.max(...prev.map((e) => e.id)) : 0;
        const entry: LiftingEntry = {
          id: maxId + 1,
          userId: "local",
          date: todayString(),
          exerciseName: data.exerciseName,
          weight: data.weight,
          sets: data.sets,
          reps: data.reps,
          totalWork: computeTotalWork(data.weight, data.sets, data.reps),
          loggedAt: new Date() as unknown as Date,
        };
        const next = [...prev, entry];
        localStorage.setItem(LS_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const clearEntries = useCallback(() => {
    localStorage.setItem(LS_KEY, JSON.stringify([]));
    setEntries([]);
  }, []);

  return { entries, prMap, addEntry, clearEntries };
}
