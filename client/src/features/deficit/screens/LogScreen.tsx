import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogHistoryTable } from "../components/LogHistoryTable";
import type { LogWithEstimatedWeight } from "@/lib/calculations";

interface LogScreenProps {
  logsWithEstWeight: LogWithEstimatedWeight[];
  onBack: () => void;
  onDeleteDay: (date: string) => Promise<void>;
}

export function LogScreen({ logsWithEstWeight, onBack, onDeleteDay }: LogScreenProps) {
  return (
    <div className="h-screen flex flex-col max-w-md mx-auto pt-safe pb-safe">
      {/* Header */}
      <div className="flex items-center px-3 h-11 flex-shrink-0 border-b border-[var(--border-subtle)]">
        <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1
          className="flex-1 text-center uppercase tracking-[0.08em] font-medium pr-9"
          style={{ fontSize: 'var(--type-label)', color: 'var(--text-secondary)' }}
        >
          History
        </h1>
      </div>

      {/* Scrollable table — the only scrollable screen */}
      <div className="flex-1 overflow-hidden flex flex-col px-3 pb-3">
        <LogHistoryTable logs={logsWithEstWeight} onDeleteDay={onDeleteDay} />
      </div>
    </div>
  );
}
