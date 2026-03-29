import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { UserSettings, DailyLog, LiftingEntry, LiftingExercise } from "@shared/schema";

interface ExportFile {
  settings: UserSettings | null;
  logs: DailyLog[];
  liftingEntries: LiftingEntry[];
  liftingTemplate: LiftingExercise[];
}

interface ImportScreenProps {
  onStartFresh: () => void;
}

export function ImportScreen({ onStartFresh }: ImportScreenProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [importing, setImporting] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setError("");

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string) as ExportFile;

        if (!data.settings) {
          throw new Error("No settings found in export file.");
        }

        // Write settings (normalize userId to "local")
        const settings: UserSettings = { ...data.settings, userId: "local" };
        localStorage.setItem("deficit:settings", JSON.stringify(settings));

        // Write logs
        const logs: DailyLog[] = (data.logs ?? []).map((l) => ({
          ...l,
          userId: "local",
        }));
        localStorage.setItem("deficit:logs", JSON.stringify(logs));

        // Write lifting entries
        const entries: LiftingEntry[] = (data.liftingEntries ?? []).map(
          (e) => ({ ...e, userId: "local" })
        );
        localStorage.setItem("deficit:lifting:entries", JSON.stringify(entries));

        // Write lifting template
        const template: LiftingExercise[] = data.liftingTemplate ?? [];
        localStorage.setItem("deficit:lifting:template", JSON.stringify(template));

        // Reload so all hooks initialize from the freshly-written localStorage
        window.location.reload();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to parse file."
        );
        setImporting(false);
      }
    };
    reader.onerror = () => {
      setError("Failed to read file.");
      setImporting(false);
    };
    reader.readAsText(file);
  }

  return (
    <div
      className="h-[100dvh] flex flex-col items-center justify-center max-w-md mx-auto px-4 gap-6 pt-safe pb-safe"
      style={{ background: "var(--surface-0)" }}
    >
      <div className="text-center">
        <h1
          className="font-bold uppercase tracking-[0.12em] mb-2"
          style={{
            fontSize: "var(--type-label)",
            color: "var(--text-secondary)",
          }}
        >
          Deficit Tracker
        </h1>
        <p
          className="uppercase tracking-[0.06em]"
          style={{ fontSize: "var(--type-micro)", color: "var(--text-muted)" }}
        >
          Welcome back. Load your existing data or start fresh.
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full">
        <Button
          variant="default"
          size="full"
          disabled={importing}
          onClick={() => fileRef.current?.click()}
        >
          {importing ? "Importing…" : "Import Existing Data"}
        </Button>

        <Button variant="outline" size="full" onClick={onStartFresh}>
          Start Fresh
        </Button>
      </div>

      {error && (
        <p
          className="text-xs text-center"
          style={{ color: "var(--accent-negative)" }}
        >
          {error}
        </p>
      )}

      <input
        ref={fileRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
