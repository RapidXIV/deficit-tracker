import { useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { LiftingExercise } from "@shared/schema";

function emptyExercise(): LiftingExercise {
  return { name: "", weight: 0, sets: 0, reps: 0 };
}

export function useLiftingTemplate() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery<{ exercises: LiftingExercise[] }>({
    queryKey: ["/api/lifting/template"],
    queryFn: () => apiRequest("GET", "/api/lifting/template"),
  });

  const exercises: LiftingExercise[] = data?.exercises?.length
    ? data.exercises
    : [emptyExercise()];

  const saveMutation = useMutation({
    mutationFn: (exercises: LiftingExercise[]) =>
      apiRequest("POST", "/api/lifting/template", { exercises }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/lifting/template"] });
    },
  });

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateExercises = (exs: LiftingExercise[]) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      saveMutation.mutate(exs);
    }, 800);
  };

  return { exercises, isLoading, updateExercises };
}
