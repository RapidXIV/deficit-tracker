import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { LiftingLog, LiftingExercise } from "@shared/schema";

function emptyExercise(): LiftingExercise {
  return { name: "", weight: 0, sets: 0, reps: 0 };
}

export function useLiftingLog(date: string) {
  const qc = useQueryClient();

  const { data: serverLog } = useQuery<LiftingLog | null>({
    queryKey: ["/api/lifting/date", date],
    queryFn: () =>
      apiRequest<LiftingLog>("GET", `/api/lifting/${date}`).catch(() => null),
  });

  const [exercises, setExercises] = useState<LiftingExercise[]>([emptyExercise()]);
  const [isComplete, setIsComplete] = useState(false);
  const initializedForDate = useRef<string | null>(null);

  // Reset local state when date changes
  useEffect(() => {
    initializedForDate.current = null;
    setExercises([emptyExercise()]);
    setIsComplete(false);
  }, [date]);

  // Populate from server data once per date
  useEffect(() => {
    if (initializedForDate.current === date) return;
    if (serverLog === undefined) return; // still loading
    initializedForDate.current = date;
    if (serverLog) {
      setExercises(serverLog.exercises.length > 0 ? serverLog.exercises : [emptyExercise()]);
      setIsComplete(serverLog.complete);
    }
  }, [serverLog, date]);

  const saveMutation = useMutation({
    mutationFn: (data: { exercises: LiftingExercise[]; complete: boolean }) =>
      apiRequest<LiftingLog>("POST", "/api/lifting", { date, ...data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/lifting"] });
    },
  });

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveDebounced = (exs: LiftingExercise[], complete: boolean) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      saveMutation.mutate({ exercises: exs, complete });
    }, 800);
  };

  const updateExercises = (exs: LiftingExercise[]) => {
    setExercises(exs);
    saveDebounced(exs, isComplete);
  };

  const finishDay = async () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    await saveMutation.mutateAsync({ exercises, complete: true });
    setIsComplete(true);
  };

  const totalWork = exercises.reduce(
    (sum, ex) => sum + (ex.weight / 2.205) * 9.81 * 0.5 * ex.sets * ex.reps,
    0
  );

  return { exercises, updateExercises, isComplete, finishDay, totalWork };
}
