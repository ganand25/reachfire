"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  className?: string;
}

export function ProgressRing({
  progress,
  size = 140,
  strokeWidth = 10,
  label,
  sublabel,
  className,
}: ProgressRingProps): React.JSX.Element {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedProgress / 100) * circumference;
  const center = size / 2;
  const uid = useId();
  const gradientId = `ember-gradient-${uid.replace(/:/g, "")}`;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.62 0.26 35)" />
            <stop offset="50%" stopColor="oklch(0.70 0.24 50)" />
            <stop offset="100%" stopColor="oklch(0.82 0.18 75)" />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${center} ${center})`}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label && (
          <span className="text-lg font-bold text-foreground tabular-nums leading-tight">
            {label}
          </span>
        )}
        {sublabel && (
          <span className="text-xs text-muted-foreground text-center max-w-[70%] leading-tight">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}
