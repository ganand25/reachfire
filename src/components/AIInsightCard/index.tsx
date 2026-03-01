"use client";

import { useState, useCallback } from "react";
import { X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIInsight {
  id: string;
  text: string;
  type?: "tip" | "warning" | "success";
}

interface AIInsightCardProps {
  insight: AIInsight;
  onDismiss?: (id: string) => void;
  className?: string;
}

export function AIInsightCard({
  insight,
  onDismiss,
  className,
}: AIInsightCardProps): React.JSX.Element {
  const [dismissed, setDismissed] = useState(false);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    onDismiss?.(insight.id);
  }, [insight.id, onDismiss]);

  if (dismissed) return <></>;

  return (
    <div
      className={cn(
        "relative rounded-xl p-4 glass-card border-ember glow-ember-sm",
        "animate-in fade-in slide-in-from-bottom-2 duration-300",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <p className="text-sm text-foreground/90 leading-relaxed flex-1">{insight.text}</p>
        {onDismiss && (
          <button
            onClick={handleDismiss}
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss insight"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

interface AIInsightsPanelProps {
  insights: AIInsight[];
  isLoading?: boolean;
  onDismiss?: (id: string) => void;
  className?: string;
}

export function AIInsightsPanel({
  insights,
  isLoading = false,
  onDismiss,
  className,
}: AIInsightsPanelProps): React.JSX.Element {
  if (isLoading) {
    return (
      <div className={cn("space-y-3", className)}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl p-4 border border-border animate-pulse">
            <div className="flex gap-3">
              <div className="w-4 h-4 rounded bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-4/5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {insights.map((insight) => (
        <AIInsightCard key={insight.id} insight={insight} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
