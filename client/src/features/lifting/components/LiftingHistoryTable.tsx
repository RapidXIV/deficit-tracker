import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatHistoryDate } from '@/lib/date-utils';
import type { LiftingLog } from '@shared/schema';

interface LiftingHistoryTableProps {
  logs: LiftingLog[];
}

export function LiftingHistoryTable({ logs }: LiftingHistoryTableProps) {
  if (logs.length === 0) {
    return (
      <div
        className='flex-1 flex items-center justify-center uppercase tracking-[0.08em]'
        style={{ fontSize: 'var(--type-label)', color: 'var(--text-muted)' }}
      >
        No lifting logs yet.
      </div>
    );
  }

  const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className='flex-1 overflow-y-auto touch-pan-y border border-[var(--border-subtle)]'>
      <Table>
        <TableHeader>
          <TableRow className='border-b-0'>
            <TableHead className='w-8'>#</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Exercises</TableHead>
            <TableHead className='text-right'>Work (J)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((log, i) => {
            const nonEmpty = log.exercises.filter((ex) => ex.name.trim() !== '').length;
            const [dow, date] = formatHistoryDate(log.date).split(' ');
            return (
              <TableRow key={log.id}>
                <TableCell style={{ color: 'var(--text-muted)' }}>{i + 1}</TableCell>
                <TableCell>
                  <span style={{ display: 'inline-block', width: '2ch', minWidth: '2ch' }}>{dow}</span>
                  {date}
                </TableCell>
                <TableCell style={{ color: 'var(--text-secondary)' }}>
                  {nonEmpty} exercise{nonEmpty !== 1 ? 's' : ''}
                </TableCell>
                <TableCell
                  className='text-right font-bold'
                  style={{ color: 'var(--accent-positive)' }}
                >
                  +{Math.round(log.totalWork).toLocaleString()}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
