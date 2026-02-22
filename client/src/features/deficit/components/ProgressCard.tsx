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
  const clampedProgress = Math.max(0, Math.min(100, progressPercent));

  return (
    <div
      className="py-[14px] px-4"
      style={{
        background: 'var(--surface-1)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span
          className="font-medium uppercase tracking-[0.08em]"
          style={{ fontSize: 'var(--type-label)', color: 'var(--text-secondary)' }}
        >
          Progress ({progressPercent}%)
        </span>
        <span
          className="tabular-nums"
          style={{ fontSize: 'var(--type-label)', color: 'var(--text-secondary)' }}
        >
          Goal: {goalCalStr} cal
        </span>
      </div>

      {/* Progress bar with milestone tick marks */}
      <div className="relative">
        <Progress value={clampedProgress} />
        {[25, 50, 75].map((pct) => (
          <div
            key={pct}
            className="absolute top-0 bottom-0 w-px pointer-events-none"
            style={{ left: `${pct}%`, background: 'var(--border-medium)' }}
          />
        ))}
      </div>

      {/* 2×2 stats grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3">
        {/* Streak */}
        <div>
          <div
            className="font-medium uppercase tracking-[0.08em] leading-none mb-1"
            style={{ fontSize: 'var(--type-label)', color: 'var(--text-secondary)' }}
          >
            Streak
          </div>
          <div
            className="font-semibold tabular-nums leading-tight"
            style={{ fontSize: 'var(--type-value)' }}
          >
            {deficitStreak > 0 ? (
              <span className="streak-ember" style={{ color: 'var(--accent-streak)' }}>
                🔥 {deficitStreak}d
              </span>
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>—</span>
            )}
          </div>
        </div>

        {/* Est. lbs */}
        <div className="text-right">
          <div
            className="font-medium uppercase tracking-[0.08em] leading-none mb-1"
            style={{ fontSize: 'var(--type-label)', color: 'var(--text-secondary)' }}
          >
            Est. lbs
          </div>
          <div
            className="font-semibold tabular-nums leading-tight"
            style={{ fontSize: 'var(--type-value)', color: 'var(--text-primary)' }}
          >
            {latestEstimatedWeight.toFixed(1)}
          </div>
        </div>

        {/* Est. Complete */}
        <div>
          <div
            className="font-medium uppercase tracking-[0.08em] leading-none mb-1"
            style={{ fontSize: 'var(--type-label)', color: 'var(--text-secondary)' }}
          >
            Est. Complete
          </div>
          <div
            className="font-semibold tabular-nums leading-tight"
            style={{ fontSize: 'var(--type-value)', color: 'var(--text-primary)' }}
          >
            {estimatedCompletionDate ? formatCompletionDate(estimatedCompletionDate) : '—'}
          </div>
        </div>

        {/* Goal lbs */}
        <div className="text-right">
          <div
            className="font-medium uppercase tracking-[0.08em] leading-none mb-1"
            style={{ fontSize: 'var(--type-label)', color: 'var(--text-secondary)' }}
          >
            Goal lbs
          </div>
          <div
            className="font-semibold tabular-nums leading-tight"
            style={{ fontSize: 'var(--type-value)', color: 'var(--text-primary)' }}
          >
            {settings.goalWeight}
          </div>
        </div>
      </div>
    </div>
  );
}
