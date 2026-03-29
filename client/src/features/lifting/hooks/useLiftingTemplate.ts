import { useState, useRef, useCallback } from "react";
import type { LiftingExercise } from "@shared/schema";

const LS_KEY = "deficit:lifting:template";

function emptyExercise(): LiftingExercise {
  return { name: "", weight: 0, sets: 0, reps: 0 };
}

function load(): LiftingExercise[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const parsed = raw ? (JSON.parse(raw) as LiftingExercise[]) : [];
    return parsed.length > 0 ? parsed : [emptyExercise()];
  } catch {
    return [emptyExercise()];
  }
}

export function useLiftingTemplate() {
  const [exercises, setExercises] = useState<LiftingExercise[]>(load);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateExercises = useCallback((exs: LiftingExercise[]) => {
    setExercises(exs);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      localStorage.setItem(LS_KEY, JSON.stringify(exs));
    }, 800);
  }, []);

  return { exercises, isLoading: false, updateExercises };
}
