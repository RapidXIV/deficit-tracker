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
        background: '#48b8b8',
        border: '3px solid #1a1a18',
        borderRadius: '16px',
        boxShadow: '4px 4px 0px #1a1a18',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span
          className="font-medium uppercase tracking-[0.08em]"
          style={{ fontSize: 'var(--type-label)', color: 'rgba(255,255,255,0.85)' }}
        >
          Progress ({progressPercent}%)
        </span>
        <span
          className="tabular-nums"
          style={{ fontSize: 'var(--type-label)', color: 'rgba(255,255,255,0.85)' }}
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
            style={{ left: `${pct}%`, background: 'rgba(255,255,255,0.35)' }}
          />
        ))}
      </div>

      {/* Stats: 3-col top row, 2-col bottom row */}
      <div className="mt-3 flex flex-col gap-y-2">
        {/* Top row: Streak | Avg. Deficit | Est. Complete */}
        <div className="grid grid-cols-3">
          {/* Streak */}
          <div>
            <div
              className="font-medium uppercase tracking-[0.08em] leading-none mb-1"
              style={{ fontSize: 'var(--type-label)', color: 'rgba(255,255,255,0.85)' }}
            >
              Streak
            </div>
            <div
              className="font-semibold tabular-nums leading-tight"
              style={{ fontSize: 'var(--type-value)' }}
            >
              {deficitStreak > 0 ? (
                <span className="streak-ember" style={{ color: '#ffffff' }}>
                  🔥 {deficitStreak}d
                </span>
              ) : (
                <span style={{ color: 'rgba(255,255,255,0.6)' }}>—</span>
              )}
            </div>
          </div>

          {/* Avg. Deficit */}
          <div className="text-center">
            <div
              className="font-medium uppercase tracking-[0.08em] leading-none mb-1"
              style={{ fontSize: 'var(--type-label)', color: 'rgba(255,255,255,0.85)' }}
            >
              Avg. Deficit
            </div>
            <div
              className="font-semibold tabular-nums leading-tight"
              style={{ fontSize: 'var(--type-value)', color: '#ffffff' }}
            >
              {stats.avgDailyDeficit !== 0
                ? (stats.avgDailyDeficit > 0 ? '+' : '') + Math.round(stats.avgDailyDeficit)
                : '—'}
            </div>
          </div>

          {/* Est. Complete */}
          <div className="text-right">
            <div
              className="font-medium uppercase tracking-[0.08em] leading-none mb-1"
              style={{ fontSize: 'var(--type-label)', color: 'rgba(255,255,255,0.85)' }}
            >
              Est. Complete
            </div>
            <div
              className="font-semibold tabular-nums leading-tight"
              style={{ fontSize: 'var(--type-value)', color: '#ffffff' }}
            >
              {estimatedCompletionDate ? formatCompletionDate(estimatedCompletionDate) : '—'}
            </div>
          </div>
        </div>

        {/* Bottom row: Est. lbs | Goal lbs */}
        <div className="grid grid-cols-2">
          {/* Est. lbs */}
          <div>
            <div
              className="font-medium uppercase tracking-[0.08em] leading-none mb-1"
              style={{ fontSize: 'var(--type-label)', color: 'rgba(255,255,255,0.85)' }}
            >
              Est. lbs
            </div>
            <div
              className="font-semibold tabular-nums leading-tight"
              style={{ fontSize: 'var(--type-value)', color: '#ffffff' }}
            >
              {latestEstimatedWeight.toFixed(1)}
            </div>
          </div>

          {/* Goal lbs */}
          <div className="text-right">
            <div
              className="font-medium uppercase tracking-[0.08em] leading-none mb-1"
              style={{ fontSize: 'var(--type-label)', color: 'rgba(255,255,255,0.85)' }}
            >
              Goal lbs
            </div>
            <div
              className="font-semibold tabular-nums leading-tight"
              style={{ fontSize: 'var(--type-value)', color: '#ffffff' }}
            >
              {settings.goalWeight}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
