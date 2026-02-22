import { useState } from "react";
import { X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
} from "@/components/ui/alert-dialog";
import { formatShortDate, formatDeficit } from "@/lib/date-utils";
import type { LogWithEstimatedWeight } from "@/lib/calculations";

interface LogHistoryTableProps {
  logs: LogWithEstimatedWeight[];
  onDeleteDay: (date: string) => Promise<void>;
}

export function LogHistoryTable({ logs, onDeleteDay }: LogHistoryTableProps) {
  const [deletingDate, setDeletingDate] = useState<string | null>(null);

  if (logs.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-xs uppercase tracking-widest">
        No logs yet. Start tracking!
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8">#</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">In</TableHead>
            <TableHead className="text-right">Out</TableHead>
            <TableHead className="text-right">Def</TableHead>
            <TableHead className="text-right">Est.</TableHead>
            <TableHead className="w-8"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="text-muted-foreground">{log.dayNumber}</TableCell>
              <TableCell>{formatShortDate(log.date)}</TableCell>
              <TableCell className="text-right tabular-nums">
                {log.caloriesIn.toLocaleString()}
              </TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground">
                {log.caloriesOut > 0 ? log.caloriesOut.toLocaleString() : "—"}
              </TableCell>
              <TableCell
                className={`text-right tabular-nums font-bold ${
                  log.deficit >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {formatDeficit(log.deficit)}
              </TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground">
                {log.estWeight.toFixed(1)}
              </TableCell>
              <TableCell className="text-right">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      className="text-muted-foreground hover:text-red-400 transition-colors p-1"
                      aria-label="Delete day"
                    >
                      <X className="h-3 w-3" />
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
                      <AlertDialogAction
                        onClick={() => onDeleteDay(log.date)}
                      >
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
