import { useMemo } from "react";
import type { UserSettings, DailyLog } from "@shared/schema";
import {
  computeDeficitStats,
  computeLogsWithEstimatedWeights,
  calculateTDEE,
  calculateEstimatedWeight,
  type DeficitStats,
  type LogWithEstimatedWeight,
} from "@/lib/calculations";

export function useDeficitStats(
  settings: UserSettings | null,
  logs: DailyLog[]
) {
  const stats: DeficitStats = useMemo(
    () => computeDeficitStats(settings, logs),
    [settings, logs]
  );

  const logsWithEstWeight: LogWithEstimatedWeight[] = useMemo(
    () =>
      settings
        ? computeLogsWithEstimatedWeights(logs, settings.startWeight)
        : [],
    [settings, logs]
  );

  // Dynamic TDEE: calculated using the latest estimated weight
  const dynamicTDEE: number = useMemo(() => {
    if (!settings) return 0;
    return calculateTDEE(
      stats.latestEstimatedWeight,
      settings.heightFt,
      settings.heightIn,
      settings.age,
      settings.sex as "male" | "female"
    );
  }, [settings, stats.latestEstimatedWeight]);

  return { stats, logsWithEstWeight, dynamicTDEE };
}
