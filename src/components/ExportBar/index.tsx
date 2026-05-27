'use client';

import { useState } from 'react';
import { Download, FileText, Printer, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExportBarProps {
  onExportCSV: () => void;
  onReset?: () => void;
  pdfElementId?: string;
  pdfFilename?: string;
  className?: string;
}

export function ExportBar({
  onExportCSV,
  onReset,
  pdfElementId,
  pdfFilename,
  className,
}: ExportBarProps): React.JSX.Element {
  const [pdfLoading, setPdfLoading] = useState(false);

  async function handlePDF(): Promise<void> {
    if (!pdfElementId || !pdfFilename) {
      window.print();
      return;
    }
    setPdfLoading(true);
    try {
      const { downloadPDF } = await import('@/lib/pdf');
      await downloadPDF(pdfElementId, pdfFilename);
    } catch {
      window.print();
    } finally {
      setPdfLoading(false);
    }
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <button
        onClick={onExportCSV}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
      >
        <Download className="w-3.5 h-3.5" />
        CSV
      </button>
      <button
        onClick={handlePDF}
        disabled={pdfLoading}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors disabled:opacity-50"
      >
        <FileText className="w-3.5 h-3.5" />
        {pdfLoading ? 'Generating…' : 'PDF'}
      </button>
      <button
        onClick={() => window.print()}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
      >
        <Printer className="w-3.5 h-3.5" />
        Print
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
