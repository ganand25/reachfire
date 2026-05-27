'use client';

import { useState, useEffect, useRef } from 'react';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InfoTooltipProps {
  term: string;
  explanation: string;
}

export function InfoTooltip({ term, explanation }: InfoTooltipProps): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent): void {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <span ref={containerRef} className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={`Info about ${term}`}
        className={cn(
          'ml-1 inline-flex items-center justify-center rounded-full p-0.5',
          'text-muted-foreground hover:text-foreground transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50'
        )}
      >
        <Info className="h-3.5 w-3.5" />
      </button>

      {open && (
        <span
          role="tooltip"
          className={cn(
            'absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2',
            'max-w-xs rounded-lg border border-border bg-popover p-3 shadow-lg',
            'text-sm text-popover-foreground'
          )}
        >
          <span className="font-semibold">{term}</span>
          <span className="mt-1 block text-xs text-muted-foreground">{explanation}</span>
        </span>
      )}
    </span>
  );
}
