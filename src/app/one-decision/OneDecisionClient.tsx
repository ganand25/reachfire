"use client";
import { PageEnter } from "@/components/Animated";

import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Check } from "lucide-react";
import { CurrencyInput } from "@/components/CurrencyInput";
import { PRESET_DECISIONS, analyzeDecision, combinedDecisionImpact } from "@/lib/calculations/decisions";
import { cn } from "@/lib/utils";

const CATEGORY_COLORS: Record<string, string> = {
  food: "text-orange-400",
  transport: "text-blue-400",
  housing: "text-purple-400",
  subscriptions: "text-pink-400",
  income: "text-emerald-400",
  investing: "text-amber-400",
};

export function OneDecisionClient(): React.JSX.Element {
  const [currentPortfolio, setCurrentPortfolio] = useState(100000);
  const [currentMonthlySavings, setCurrentMonthlySavings] = useState(2000);
  const [annualExpenses, setAnnualExpenses] = useState(60000);
  const [returnRate] = useState(0.07);
  const [selectedDecisions, setSelectedDecisions] = useState<Set<string>>(new Set(["coffee"]));

  const toggleDecision = (id: string): void => {
    setSelectedDecisions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedDecisionObjects = PRESET_DECISIONS.filter((d) => selectedDecisions.has(d.id));

  const impacts = useMemo(
    () =>
      PRESET_DECISIONS.map((d) =>
        analyzeDecision(d, currentPortfolio, currentMonthlySavings, annualExpenses, returnRate)
      ),
    [currentPortfolio, currentMonthlySavings, annualExpenses, returnRate]
  );

  const combined = useMemo(
    () =>
      combinedDecisionImpact(
        selectedDecisionObjects,
        currentPortfolio,
        currentMonthlySavings,
        annualExpenses,
        returnRate
      ),
    [selectedDecisionObjects, currentPortfolio, currentMonthlySavings, annualExpenses, returnRate]
  );

  const chartData = selectedDecisionObjects.length > 0
    ? [
        { period: "5 years", value: Math.round(combined.year5Total) },
        { period: "10 years", value: Math.round(combined.year10Total) },
        { period: "20 years", value: Math.round(combined.year20Total) },
        { period: "30 years", value: Math.round(combined.year30Total) },
      ]
    : [];

  function formatMoney(v: number): string {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
    if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
    return `$${v.toFixed(0)}`;
  }

  return (
    <PageEnter>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">One Decision Impact</h1>
        <p className="text-muted-foreground max-w-2xl">
          $5/day feels like nothing. But it&apos;s $56,000 in 20 years at 7% returns — and 8 months of your life back.
          See the insane compound impact of a single lifestyle change.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Context inputs */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h2 className="font-semibold text-sm">Your Context</h2>
            <CurrencyInput label="Current Portfolio" value={currentPortfolio} onChange={setCurrentPortfolio} />
            <CurrencyInput label="Monthly Savings (current)" value={currentMonthlySavings} onChange={setCurrentMonthlySavings} />
            <CurrencyInput label="Annual Expenses" value={annualExpenses} onChange={setAnnualExpenses} />
          </div>

          {/* Combined impact */}
          {selectedDecisionObjects.length > 0 && (
            <div className="rounded-xl border border-ember bg-card p-5 glow-ember-sm space-y-3">
              <h2 className="font-semibold text-sm gradient-ember-text">
                {selectedDecisionObjects.length === 1 ? selectedDecisionObjects[0].label : `${selectedDecisionObjects.length} decisions combined`}
              </h2>
              <div className="text-2xl font-bold tabular-nums">{formatMoney(combined.year20Total)}</div>
              <div className="text-xs text-muted-foreground">invested value in 20 years</div>
              <div className="text-sm font-semibold text-emerald-400">
                {combined.totalMonthsEarlier} months earlier to FIRE
              </div>
              <div className="text-xs text-muted-foreground">
                +${combined.totalMonthlySavings.toLocaleString()}/mo → ${(combined.totalMonthlySavings * 12).toLocaleString()}/yr
              </div>
            </div>
          )}
        </div>

        {/* Decisions + Chart */}
        <div className="lg:col-span-2 space-y-5">
          {/* Chart */}
          {chartData.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="font-semibold text-sm mb-4">Compound Growth of Selected Decision(s)</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.62 0.26 35)" />
                      <stop offset="100%" stopColor="oklch(0.82 0.18 75)" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="period" tick={{ fontSize: 11 }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} tickFormatter={formatMoney} />
                  <Tooltip formatter={(v: number | undefined) => v !== undefined ? formatMoney(v) : ""} contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="value" fill="url(#barGrad)" radius={[4, 4, 0, 0]} name="Invested Value" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Decision cards */}
          <div className="space-y-2">
            <h2 className="font-semibold text-sm">Choose your decisions</h2>
            <p className="text-xs text-muted-foreground mb-3">Click to select one or more decisions and see the combined impact</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESET_DECISIONS.map((decision) => {
                const impact = impacts.find((i) => i.decision.id === decision.id);
                const isSelected = selectedDecisions.has(decision.id);

                return (
                  <button
                    key={decision.id}
                    onClick={() => toggleDecision(decision.id)}
                    className={cn(
                      "text-left p-4 rounded-xl border transition-all",
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:border-primary/30"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{decision.label}</span>
                      <div className={cn("w-4 h-4 rounded-full border flex items-center justify-center transition-colors", isSelected ? "bg-primary border-primary" : "border-border")}>
                        {isSelected && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{decision.description}</p>
                    <div className="flex items-center justify-between">
                      <span className={cn("text-xs font-medium", CATEGORY_COLORS[decision.category] ?? "text-muted-foreground")}>
                        +${decision.monthlySavings}/mo
                      </span>
                      {impact && (
                        <span className="text-xs text-emerald-400">
                          {formatMoney(impact.year20Value)} in 20yr
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
    </PageEnter>
  );
}
