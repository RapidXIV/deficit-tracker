import { useState, useCallback } from "react";
import type { UserSettings } from "@shared/schema";

const LS_KEY = "deficit:settings";

function load(): UserSettings | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as UserSettings) : null;
  } catch {
    return null;
  }
}

function persist(s: UserSettings): void {
  localStorage.setItem(LS_KEY, JSON.stringify(s));
}

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(load);

  const saveSettings = useCallback(
    async (data: Omit<UserSettings, "id" | "userId">) => {
      const s: UserSettings = { id: "settings", userId: "local", ...data };
      persist(s);
      setSettings(s);
      return s;
    },
    []
  );

  const patchGoalWeight = useCallback(async (data: { goalWeight: number }) => {
    setSettings((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, goalWeight: data.goalWeight };
      persist(updated);
      return updated;
    });
  }, []);

  return {
    settings,
    isLoading: false,
    saveSettings,
    isSaving: false,
    patchGoalWeight,
  };
}
