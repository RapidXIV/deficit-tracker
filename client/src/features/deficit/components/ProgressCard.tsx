import { Progress } from "@/components/ui/progress";
import { formatCompletionDate } from "@/lib/date-utils";
import type { DeficitStats } from "@/lib/calculations";
import type { UserSettings } from "@shared/schema";

interface ProgressCardProps {
  stats: DeficitStats;
  settings: UserSettings;
}

export function ProgressCard({ stats, settings }: ProgressCardProps) {
  const { progressPercent, deficitStreak, latestEstimatedWeight, estimatedCompletionDate } = stats;
  const goalCalStr = Math.round(stats.totalDeficitGoal).toLocaleString();

  return (
    <div className="border border-white/20 rounded-lg p-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted-foreground uppercase tracking-widest">
          Progress ({progressPercent}%)
        </span>
        <span className="text-xs text-muted-foreground tabular-nums">
          Goal: {goalCalStr} cal
        </span>
      </div>

      {/* Progress bar */}
      <Progress value={Math.max(0, Math.min(100, progressPercent))} />

      {/* 2x2 stats grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
        {/* Streak */}
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-widest leading-none mb-0.5">
            Streak
          </div>
          <div className="text-sm font-bold tabular-nums leading-tight">
            {deficitStreak > 0 ? (
              <span className="text-orange-400">🔥 {deficitStreak}d</span>
            ) : (
              <span>—</span>
            )}
          </div>
        </div>

        {/* Est. lbs */}
        <div className="text-right">
          <div className="text-xs text-muted-foreground uppercase tracking-widest leading-none mb-0.5">
            Est. lbs
          </div>
          <div className="text-sm font-bold tabular-nums leading-tight">
            {latestEstimatedWeight.toFixed(1)}
          </div>
        </div>

        {/* Est. Complete */}
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-widest leading-none mb-0.5">
            Est. Complete
          </div>
          <div className="text-sm font-bold tabular-nums leading-tight">
            {estimatedCompletionDate
              ? formatCompletionDate(estimatedCompletionDate)
              : "—"}
          </div>
        </div>

        {/* Goal lbs */}
        <div className="text-right">
          <div className="text-xs text-muted-foreground uppercase tracking-widest leading-none mb-0.5">
            Goal lbs
          </div>
          <div className="text-sm font-bold tabular-nums leading-tight">
            {settings.goalWeight}
          </div>
        </div>
      </div>
    </div>
  );
}
