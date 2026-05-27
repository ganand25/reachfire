'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { MonteCarloResult } from '@/types/fire';
import { cn } from '@/lib/utils';

interface MonteCarloChartProps {
  result: MonteCarloResult;
  years: number;
  className?: string;
}

function formatMoney(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

export function MonteCarloChart({
  result,
  years,
  className,
}: MonteCarloChartProps): React.JSX.Element {
  // Build percentile band data from paths
  const data: Array<{
    year: number;
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
  }> = [];

  for (let y = 0; y < years; y++) {
    const yearValues = result.paths
      .map((path) => path[y] ?? 0)
      .filter((v) => v >= 0)
      .sort((a, b) => a - b);

    if (yearValues.length === 0) continue;

    const pct = (p: number): number => {
      const idx = Math.floor((p / 100) * (yearValues.length - 1));
      return yearValues[idx] ?? 0;
    };

    data.push({
      year: y + 1,
      p10: pct(10),
      p25: pct(25),
      p50: pct(50),
      p75: pct(75),
      p90: pct(90),
    });
  }

  const successColor =
    result.successRate >= 90
      ? 'oklch(0.65 0.22 142)'
      : result.successRate >= 70
        ? 'oklch(0.72 0.16 65)'
        : 'oklch(0.52 0.18 250)';

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center gap-4 mb-3">
        <div className="flex flex-col">
          <span className="text-3xl font-bold tabular-nums" style={{ color: successColor }}>
            {result.successRate.toFixed(0)}%
          </span>
          <span className="text-xs text-muted-foreground">success rate</span>
        </div>
        <div className="flex gap-4 text-xs text-muted-foreground flex-1">
          <div>
            <div className="font-medium text-foreground">{formatMoney(result.percentile10)}</div>
            <div>10th %ile</div>
          </div>
          <div>
            <div className="font-medium text-foreground">{formatMoney(result.percentile50)}</div>
            <div>Median</div>
          </div>
          <div>
            <div className="font-medium text-foreground">{formatMoney(result.percentile90)}</div>
            <div>90th %ile</div>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="mc90" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.82 0.18 75)" stopOpacity={0.15} />
              <stop offset="100%" stopColor="oklch(0.82 0.18 75)" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="mc75" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.72 0.20 50)" stopOpacity={0.25} />
              <stop offset="100%" stopColor="oklch(0.72 0.20 50)" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="mc50" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.62 0.26 35)" stopOpacity={0.4} />
              <stop offset="100%" stopColor="oklch(0.62 0.26 35)" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 10, fill: 'oklch(0.52 0.02 30)' }}
            tickLine={false}
            stroke="var(--border)"
          />
          <YAxis
            tick={{ fontSize: 10, fill: 'oklch(0.52 0.02 30)' }}
            tickLine={false}
            tickFormatter={formatMoney}
            stroke="var(--border)"
          />
          <Tooltip
            formatter={(value: number | undefined) =>
              value !== undefined ? formatMoney(value) : ''
            }
            contentStyle={{
              backgroundColor: 'var(--popover)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              fontSize: 12,
            }}
          />
          {/* Bands from outer to inner */}
          <Area type="monotone" dataKey="p90" stroke="none" fill="url(#mc90)" />
          <Area type="monotone" dataKey="p75" stroke="none" fill="url(#mc75)" />
          <Area
            type="monotone"
            dataKey="p50"
            stroke="oklch(0.70 0.24 50)"
            strokeWidth={2}
            fill="url(#mc50)"
          />
          <Area type="monotone" dataKey="p25" stroke="none" fill="transparent" />
          <Area
            type="monotone"
            dataKey="p10"
            stroke="oklch(0.52 0.18 250)"
            strokeWidth={1}
            strokeDasharray="3 2"
            fill="transparent"
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="flex gap-3 mt-2 flex-wrap">
        {[
          { color: 'oklch(0.82 0.18 75 / 0.4)', label: '90th %ile band' },
          { color: 'oklch(0.70 0.24 50)', label: 'Median (50th)' },
          { color: 'oklch(0.52 0.18 250)', label: '10th %ile' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className="w-3 h-0.5 inline-block rounded"
              style={{ backgroundColor: item.color }}
            />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
