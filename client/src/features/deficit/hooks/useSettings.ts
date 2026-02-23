import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { UserSettings } from "@shared/schema";

export function useSettings() {
  const qc = useQueryClient();

  const { data: settings, isLoading } = useQuery<UserSettings | null>({
    queryKey: ["/api/settings"],
    queryFn: () =>
      apiRequest<UserSettings>("GET", "/api/settings").catch((e: Error) => {
        if (e.message === "No settings found") return null;
        throw e;
      }),
  });

  const saveMutation = useMutation({
    mutationFn: (data: Omit<UserSettings, "id" | "userId">) =>
      apiRequest<UserSettings>("POST", "/api/settings", data),
    onSuccess: (updated) => {
      qc.setQueryData(["/api/settings"], updated);
    },
  });

  const patchMutation = useMutation({
    mutationFn: (data: { goalWeight: number }) =>
      apiRequest<UserSettings>("PATCH", "/api/settings", data),
    onSuccess: (updated) => {
      qc.setQueryData(["/api/settings"], updated);
    },
  });

  return {
    settings: settings ?? null,
    isLoading,
    saveSettings: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    patchGoalWeight: patchMutation.mutateAsync,
  };
}
