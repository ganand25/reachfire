"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { NumberTicker } from "@/components/NumberTicker";

interface StatCardProps {
  label: string;
  value: number;
  format?: "currency" | "percent" | "integer" | "decimal";
  decimals?: number;
  prefix?: string;
  suffix?: string;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  glow?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: { card: "p-4", value: "text-2xl", label: "text-xs" },
  md: { card: "p-5", value: "text-3xl", label: "text-sm" },
  lg: { card: "p-6", value: "text-4xl", label: "text-sm" },
};

export function StatCard({
  label,
  value,
  format = "integer",
  decimals = 0,
  prefix,
  suffix,
  subtitle,
  trend,
  glow = false,
  className,
  size = "md",
}: StatCardProps): React.JSX.Element {
  const sizes = sizeClasses[size];

  return (
    <motion.div
      className={cn(
        "rounded-xl border bg-card flex flex-col gap-1 transition-colors",
        sizes.card,
        glow && "border-ember glow-ember-sm",
        !glow && "border-border",
        className
      )}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <p className={cn("text-muted-foreground font-medium", sizes.label)}>{label}</p>
      <div className="flex items-baseline gap-1">
        <NumberTicker
          value={value}
          format={format}
          decimals={decimals}
          prefix={prefix}
          suffix={suffix}
          className={cn("font-bold tracking-tight", sizes.value)}
        />
        {trend && (
          <span
            className={cn(
              "text-sm font-medium",
              trend === "up" && "text-emerald-400",
              trend === "down" && "text-destructive",
              trend === "neutral" && "text-muted-foreground"
            )}
          >
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
    </motion.div>
  );
}
