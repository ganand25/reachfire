'use client';

import { useCallback, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface CurrencyInputProps {
  label: React.ReactNode;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  hint?: string;
  className?: string;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
}

function formatDisplay(value: number): string {
  if (value === 0) return '';
  return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function parseInput(raw: string): number {
  const cleaned = raw.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

export function CurrencyInput({
  label,
  value,
  onChange,
  placeholder = '0',
  hint,
  className,
  prefix = '$',
  suffix,
  min = 0,
  max,
}: CurrencyInputProps): React.JSX.Element {
  const [focused, setFocused] = useState(false);
  const [rawValue, setRawValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFocus = useCallback(() => {
    setFocused(true);
    setRawValue(value > 0 ? String(value) : '');
  }, [value]);

  const handleBlur = useCallback(() => {
    setFocused(false);
    const parsed = parseInput(rawValue);
    const clamped = max !== undefined ? Math.min(parsed, max) : parsed;
    const final = Math.max(min, clamped);
    onChange(final);
    setRawValue('');
  }, [rawValue, onChange, min, max]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9.]/g, '');
    setRawValue(raw);
  }, []);

  const displayValue = focused ? rawValue : formatDisplay(value);

  return (
    <div className={cn('space-y-1.5', className)}>
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div
        className={cn(
          'flex items-center rounded-lg border bg-background px-3 py-2 transition-colors',
          focused
            ? 'border-primary ring-1 ring-primary/30'
            : 'border-border hover:border-muted-foreground/50'
        )}
      >
        {prefix && (
          <span className="text-muted-foreground text-sm mr-1.5 select-none">{prefix}</span>
        )}
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground tabular-nums"
        />
        {suffix && (
          <span className="text-muted-foreground text-sm ml-1.5 select-none">{suffix}</span>
        )}
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
