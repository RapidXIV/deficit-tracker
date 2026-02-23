import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface AuthUser {
  id: string;
  username: string;
}

export function useAuth() {
  const { data: user, isLoading } = useQuery<AuthUser | null>({
    queryKey: ["/api/auth/me"],
    queryFn: () =>
      apiRequest<AuthUser>("GET", "/api/auth/me").catch(() => null),
    staleTime: Infinity,
  });

  return {
    user: user ?? null,
    isAuthenticated: !!user,
    isLoading,
  };
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiRequest("POST", "/api/auth/logout"),
    onSuccess: () => {
      qc.clear();
    },
  });
}
