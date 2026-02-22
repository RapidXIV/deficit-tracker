import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { DailyLog } from "@shared/schema";

export function useLogs() {
  const qc = useQueryClient();

  const { data: logs = [], isSuccess: isLogsLoaded } = useQuery<DailyLog[]>({
    queryKey: ["/api/logs"],
    queryFn: () => apiRequest<DailyLog[]>("GET", "/api/logs"),
  });

  const resetDayMutation = useMutation({
    mutationFn: (date: string) =>
      apiRequest("DELETE", `/api/logs/${date}`),
    onSettled: () => qc.invalidateQueries({ queryKey: ["/api/logs"] }),
  });

  const resetAllMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", "/api/logs"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/logs"] }),
  });

  return {
    logs,
    isLogsLoaded,
    resetDay: resetDayMutation.mutateAsync,
    resetAll: resetAllMutation.mutateAsync,
  };
}
