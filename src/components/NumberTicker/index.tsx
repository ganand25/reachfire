"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface NumberTickerProps {
  value: number;
  format?: "currency" | "percent" | "integer" | "decimal";
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number; // animation ms
  className?: string;
}

function formatNumber(
  value: number,
  format: NumberTickerProps["format"],
  decimals: number = 0
): string {
  switch (format) {
    case "currency":
      if (value >= 1_000_000) {
        return `$${(value / 1_000_000).toFixed(2)}M`;
      }
      if (value >= 1_000) {
        return `$${(value / 1_000).toFixed(0)}K`;
      }
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(value);
    case "percent":
      return `${(value * 100).toFixed(decimals)}%`;
    case "decimal":
      return value.toFixed(decimals);
    default:
      return Math.round(value).toLocaleString();
  }
}

export function NumberTicker({
  value,
  format = "integer",
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 600,
  className,
}: NumberTickerProps): React.JSX.Element {
  const [displayValue, setDisplayValue] = useState(value);
  const animFrameRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef(value);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to) return;

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    startRef.current = null;

    const animate = (timestamp: number): void => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + (to - from) * eased;
      setDisplayValue(current);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        fromRef.current = to;
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return (): void => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [value, duration]);

  return (
    <span className={cn("tabular-nums", className)}>
      {prefix}
      {formatNumber(displayValue, format, decimals)}
      {suffix}
    </span>
  );
}
