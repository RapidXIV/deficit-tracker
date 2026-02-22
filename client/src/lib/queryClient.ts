import { QueryClient } from "@tanstack/react-query";

const GUEST_ID_KEY = "deficit_guest_id";
const GUEST_MODE_KEY = "deficit_guest_mode";

export function getGuestId(): string | null {
  return localStorage.getItem(GUEST_ID_KEY);
}

export function isGuestMode(): boolean {
  return localStorage.getItem(GUEST_MODE_KEY) === "true";
}

export function startGuestSession(): string {
  let id = localStorage.getItem(GUEST_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(GUEST_ID_KEY, id);
  }
  localStorage.setItem(GUEST_MODE_KEY, "true");
  return id;
}

export function clearGuestSession(): void {
  localStorage.removeItem(GUEST_MODE_KEY);
}

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (isGuestMode()) {
    const guestId = getGuestId();
    if (guestId) headers["x-guest-id"] = guestId;
  }
  return headers;
}

export async function apiRequest<T = unknown>(
  method: string,
  url: string,
  body?: unknown
): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: getAuthHeaders(),
    credentials: "include",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error ?? res.statusText);
  }

  return res.json() as Promise<T>;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30_000,
    },
  },
});
