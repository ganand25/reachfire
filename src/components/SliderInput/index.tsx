'use client';

import { useCallback } from 'react';
import { cn } from '@/lib/utils';

interface SliderInputProps {
  label: React.ReactNode;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  format?: 'currency' | 'percent' | 'number' | 'years';
  minLabel?: string;
  maxLabel?: string;
  hint?: string;
  className?: string;
}

function formatValue(value: number, format: SliderInputProps['format']): string {
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(value);
    case 'percent':
      return `${(value * 100).toFixed(1)}%`;
    case 'years':
      return `${value} yr${value !== 1 ? 's' : ''}`;
    default:
      return value.toLocaleString();
  }
}

export function SliderInput({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format = 'number',
  minLabel,
  maxLabel,
  hint,
  className,
}: SliderInputProps): React.JSX.Element {
  const percent = max > min ? ((value - min) / (max - min)) * 100 : 0;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(parseFloat(e.target.value));
    },
    [onChange]
  );

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <span className="text-sm font-semibold text-primary tabular-nums">
          {formatValue(value, format)}
        </span>
      </div>

      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className="w-full h-2 rounded-full appearance-none cursor-pointer bg-secondary"
          style={{
            background: `linear-gradient(to right, var(--ember-1) 0%, var(--ember-2) ${percent * 0.5}%, var(--ember-3) ${percent}%, var(--secondary) ${percent}%)`,
          }}
        />
      </div>

      {(minLabel ?? maxLabel) && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{minLabel ?? formatValue(min, format)}</span>
          <span>{maxLabel ?? formatValue(max, format)}</span>
        </div>
      )}

      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}

      <style jsx>{`
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--primary);
          cursor: pointer;
          box-shadow: 0 0 8px oklch(0.7 0.24 50 / 0.4);
          border: 2px solid var(--background);
          transition:
            transform 0.1s,
            box-shadow 0.1s;
        }
        input[type='range']::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 12px oklch(0.7 0.24 50 / 0.6);
        }
        input[type='range']::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--primary);
          cursor: pointer;
          border: 2px solid var(--background);
        }
      `}</style>
    </div>
  );
}
