import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { LiftingEntry } from "@shared/schema";

export function useLiftingEntries() {
  const qc = useQueryClient();

  const { data: entries = [] } = useQuery<LiftingEntry[]>({
    queryKey: ["/api/lifting"],
    queryFn: () => apiRequest("GET", "/api/lifting"),
  });

  const addMutation = useMutation({
    mutationFn: (data: {
      exerciseName: string;
      weight: number;
      sets: number;
      reps: number;
    }) => apiRequest("POST", "/api/lifting/entry", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/lifting"] });
    },
  });

  // Max weight ever logged per exercise name
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

  const addEntry = (data: {
    exerciseName: string;
    weight: number;
    sets: number;
    reps: number;
  }) => addMutation.mutateAsync(data);

  return { entries, prMap, addEntry };
}
