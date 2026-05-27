"use client";

import { Download, Printer, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExportBarProps {
  onExportCSV: () => void;
  onReset?: () => void;
  className?: string;
}

export function ExportBar({ onExportCSV, onReset, className }: ExportBarProps): React.JSX.Element {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <button
        onClick={onExportCSV}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
      >
        <Download className="w-3.5 h-3.5" />
        Export CSV
      </button>
      <button
        onClick={() => window.print()}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
      >
        <Printer className="w-3.5 h-3.5" />
        Print / PDF
      </button>
      {onReset && (
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-destructive/30 text-sm font-medium text-destructive/70 hover:text-destructive hover:border-destructive/50 transition-colors ml-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
      )}
    </div>
  );
}
