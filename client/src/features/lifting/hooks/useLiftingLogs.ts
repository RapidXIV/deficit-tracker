import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { LiftingLog } from "@shared/schema";

export function useLiftingLogs() {
  const { data: logs = [], isLoading } = useQuery<LiftingLog[]>({
    queryKey: ["/api/lifting"],
    queryFn: () => apiRequest<LiftingLog[]>("GET", "/api/lifting"),
  });

  return { logs, isLoading };
}
