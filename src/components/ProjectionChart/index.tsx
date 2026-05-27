'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { YearlyProjection } from '@/types/fire';
import { cn } from '@/lib/utils';

interface ProjectionChartProps {
  projections: YearlyProjection[];
  fireNumber: number;
  leanFireNumber?: number;
  fatFireNumber?: number;
  showInflationAdjusted?: boolean;
  className?: string;
}

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
}

function formatMoney(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
}): React.JSX.Element | null {
  if (!active || !payload?.length) return null;

  return (
    <div className="glass-card rounded-lg p-3 text-sm shadow-lg">
      <p className="font-semibold text-foreground mb-1.5">Year {label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium text-foreground">{formatMoney(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

export function ProjectionChart({
  projections,
  fireNumber,
  leanFireNumber,
  fatFireNumber,
  showInflationAdjusted = false,
  className,
}: ProjectionChartProps): React.JSX.Element {
  const data = projections.map((p) => ({
    year: p.year,
    age: p.age,
    Nominal: Math.round(p.portfolioValue),
    'Inflation-Adjusted': Math.round(p.inflationAdjusted),
  }));

  const maxValue = Math.max(
    ...projections.map((p) => p.portfolioValue),
    fatFireNumber ?? fireNumber,
    fireNumber
  );

  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="emberGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="oklch(0.70 0.24 50)" stopOpacity={0.5} />
              <stop offset="95%" stopColor="oklch(0.70 0.24 50)" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="realGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="oklch(0.78 0.18 65)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="oklch(0.78 0.18 65)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="year"
            stroke="oklch(0.52 0.02 30)"
            tick={{ fontSize: 11, fill: 'oklch(0.52 0.02 30)' }}
            tickLine={false}
          />
          <YAxis
            stroke="oklch(0.52 0.02 30)"
            tick={{ fontSize: 11, fill: 'oklch(0.52 0.02 30)' }}
            tickLine={false}
            tickFormatter={formatMoney}
            domain={[0, Math.ceil(maxValue * 1.05)]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            formatter={(value: string) => (
              <span style={{ color: 'oklch(0.60 0.01 60)' }}>{value}</span>
            )}
          />

          {leanFireNumber && (
            <ReferenceLine
              y={leanFireNumber}
              stroke="oklch(0.70 0.24 50)"
              strokeDasharray="4 2"
              strokeWidth={1}
              label={{
                value: 'Lean FIRE',
                position: 'right',
                fontSize: 10,
                fill: 'oklch(0.70 0.24 50)',
              }}
            />
          )}
          <ReferenceLine
            y={fireNumber}
            stroke="oklch(0.72 0.20 40)"
            strokeDasharray="4 2"
            strokeWidth={1.5}
            label={{
              value: 'FIRE',
              position: 'right',
              fontSize: 10,
              fill: 'oklch(0.72 0.20 40)',
            }}
          />
          {fatFireNumber && (
            <ReferenceLine
              y={fatFireNumber}
              stroke="oklch(0.82 0.18 75)"
              strokeDasharray="4 2"
              strokeWidth={1}
              label={{
                value: 'Fat FIRE',
                position: 'right',
                fontSize: 10,
                fill: 'oklch(0.82 0.18 75)',
              }}
            />
          )}

          <Area
            type="monotone"
            dataKey="Nominal"
            stroke="oklch(0.70 0.24 50)"
            strokeWidth={2.5}
            fill="url(#emberGrad)"
            dot={false}
            activeDot={{ r: 5, fill: 'oklch(0.70 0.24 50)' }}
          />
          {showInflationAdjusted && (
            <Area
              type="monotone"
              dataKey="Inflation-Adjusted"
              stroke="oklch(0.78 0.18 65)"
              strokeWidth={1.5}
              fill="url(#realGrad)"
              dot={false}
              strokeDasharray="5 3"
              activeDot={{ r: 4, fill: 'oklch(0.78 0.18 65)' }}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
