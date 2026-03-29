import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { LiftingHistoryTable } from "../components/LiftingHistoryTable";
import { useLiftingEntries } from "../hooks/useLiftingEntries";

interface LiftingLogScreenProps {
  onBack: () => void;
}

export function LiftingLogScreen({ onBack }: LiftingLogScreenProps) {
  const { entries: logs, clearEntries } = useLiftingEntries();

  return (
    <div className="h-[100dvh] flex flex-col max-w-md mx-auto pt-safe pb-safe">
      {/* Header */}
      <div className="flex items-center px-3 h-11 flex-shrink-0 border-b border-[var(--border-subtle)]">
        <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1
          className="flex-1 text-center uppercase tracking-[0.08em] font-medium"
          style={{ fontSize: 'var(--type-label)', color: 'var(--text-secondary)' }}
        >
          Lifting History
        </h1>
        {logs.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-xs px-2" style={{ color: 'var(--accent-negative)' }}>
                Clear
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear Lifting History?</AlertDialogTitle>
                <AlertDialogDescription>
                  This deletes all lifting entries. Cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction onClick={clearEntries}>
                  Yes, Clear All
                </AlertDialogAction>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Scrollable table */}
      <div className="flex-1 overflow-hidden flex flex-col px-3 pb-3">
        <LiftingHistoryTable logs={logs} />
      </div>
    </div>
  );
}
