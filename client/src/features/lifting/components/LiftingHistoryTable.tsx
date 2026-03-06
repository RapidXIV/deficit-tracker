import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatHistoryDate } from '@/lib/date-utils';
import type { LiftingEntry } from '@shared/schema';

interface LiftingHistoryTableProps {
  logs: LiftingEntry[];
}

export function LiftingHistoryTable({ logs }: LiftingHistoryTableProps) {
  if (logs.length === 0) {
    return (
      <div
        className='flex-1 flex items-center justify-center uppercase tracking-[0.08em]'
        style={{ fontSize: 'var(--type-label)', color: 'var(--text-muted)' }}
      >
        No lifting entries yet.
      </div>
    );
  }

  // Already sorted newest-first from server; display index from end so newest = highest #
  return (
    <div className='flex-1 overflow-y-auto touch-pan-y border border-[var(--border-subtle)]'>
      <Table>
        <TableHeader>
          <TableRow className='border-b-0'>
            <TableHead className='w-8'>#</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Exercise</TableHead>
            <TableHead className='text-right'>Lbs</TableHead>
            <TableHead className='text-right'>Sets×Reps</TableHead>
            <TableHead className='text-right'>Work (J)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((entry, i) => (
            <TableRow key={entry.id}>
              <TableCell style={{ color: 'var(--text-muted)' }}>{logs.length - i}</TableCell>
              <TableCell>{formatHistoryDate(entry.date)}</TableCell>
              <TableCell style={{ color: 'var(--text-secondary)' }}>
                {entry.exerciseName}
              </TableCell>
              <TableCell className='text-right tabular-nums'>{entry.weight}</TableCell>
              <TableCell className='text-right tabular-nums'>
                {entry.sets}×{entry.reps}
              </TableCell>
              <TableCell
                className='text-right font-bold tabular-nums'
                style={{ color: 'var(--accent-positive)' }}
              >
                +{Math.round(entry.totalWork).toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
