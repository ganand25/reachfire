"use client";

import { cn } from "@/lib/utils";

interface ComparisonItem {
  label: string;
  value: number;
  sublabel?: string;
  highlighted?: boolean;
}

interface ComparisonBarProps {
  items: ComparisonItem[];
  format?: "currency" | "years" | "percent" | "number";
  className?: string;
}

function formatValue(value: number, format: ComparisonBarProps["format"]): string {
  switch (format) {
    case "currency":
      if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
      if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
      return `$${value.toFixed(0)}`;
    case "percent":
      return `${value.toFixed(1)}%`;
    case "years":
      return `${value.toFixed(1)} yrs`;
    default:
      return value.toLocaleString();
  }
}

export function ComparisonBar({
  items,
  format = "currency",
  className,
}: ComparisonBarProps): React.JSX.Element {
  const maxValue = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className={cn("space-y-3", className)}>
      {items.map((item, idx) => {
        const pct = (item.value / maxValue) * 100;

        return (
          <div key={idx} className="space-y-1">
            <div className="flex justify-between items-baseline text-sm">
              <span
                className={cn(
                  "font-medium",
                  item.highlighted ? "text-primary" : "text-foreground"
                )}
              >
                {item.label}
              </span>
              <div className="text-right">
                <span
                  className={cn(
                    "font-semibold tabular-nums",
                    item.highlighted ? "text-primary" : "text-foreground"
                  )}
                >
                  {formatValue(item.value, format)}
                </span>
                {item.sublabel && (
                  <span className="text-xs text-muted-foreground ml-1.5">{item.sublabel}</span>
                )}
              </div>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-700",
                  item.highlighted ? "gradient-ember" : "bg-muted-foreground/30"
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
