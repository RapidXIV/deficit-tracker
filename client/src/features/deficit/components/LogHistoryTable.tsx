import { useState } from 'react';
import { X } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { formatShortDate, formatDeficit } from '@/lib/date-utils';
import type { LogWithEstimatedWeight } from '@/lib/calculations';

interface LogHistoryTableProps {
  logs: LogWithEstimatedWeight[];
  onDeleteDay: (date: string) => Promise<void>;
}

export function LogHistoryTable({ logs, onDeleteDay }: LogHistoryTableProps) {
  const [deletingDate, setDeletingDate] = useState<string | null>(null);

  if (logs.length === 0) {
    return (
      <div
        className='flex-1 flex items-center justify-center uppercase tracking-[0.08em]'
        style={{ fontSize: 'var(--type-label)', color: 'var(--text-muted)' }}
      >
        No logs yet. Start tracking!
      </div>
    );
  }

  return (
    <div className='flex-1 overflow-y-auto border border-[var(--border-subtle)]'>
      <Table>
        <TableHeader>
          <TableRow className='border-b-0'>
            <TableHead className='w-8'>#</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className='text-right'>In</TableHead>
            <TableHead className='text-right'>Out</TableHead>
            <TableHead className='text-right'>Def</TableHead>
            <TableHead className='text-right'>Est.</TableHead>
            <TableHead className='w-8'></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id} className='group'>
              <TableCell style={{ color: 'var(--text-muted)' }}>
                {log.dayNumber}
              </TableCell>
              <TableCell>{formatShortDate(log.date)}</TableCell>
              <TableCell className='text-right'>
                {log.caloriesIn.toLocaleString()}
              </TableCell>
              <TableCell
                className='text-right'
                style={{ color: log.caloriesOut > 0 ? undefined : 'var(--text-muted)' }}
              >
                {log.caloriesOut > 0 ? log.caloriesOut.toLocaleString() : '--'}
              </TableCell>
              <TableCell
                className='text-right font-bold'
                style={{
                  color: log.deficit > 0
                    ? 'var(--accent-positive)'
                    : 'var(--accent-negative)',
                }}
              >
                {formatDeficit(log.deficit)}
              </TableCell>
              <TableCell
                className='text-right'
                style={{ color: 'var(--text-secondary)' }}
              >
                {log.estWeight.toFixed(1)}
              </TableCell>
              <TableCell className='text-right'>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      className='opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 text-[var(--text-muted)] hover:text-[var(--accent-negative)]'
                      aria-label='Delete day'
                    >
                      <X className='h-3 w-3' />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete {formatShortDate(log.date)}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This removes the log for this day. This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogAction onClick={() => onDeleteDay(log.date)}>
                        Delete
                      </AlertDialogAction>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
