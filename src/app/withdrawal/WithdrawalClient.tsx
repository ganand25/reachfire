"use client";
import { PageEnter } from "@/components/Animated";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";

import { useState, useMemo, useCallback } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from "recharts";
import { CurrencyInput } from "@/components/CurrencyInput";
import { SliderInput } from "@/components/SliderInput";
import { StatCard } from "@/components/StatCard";
import { ExportBar } from "@/components/ExportBar";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { downloadCSV } from "@/lib/csv";
import { fixedWithdrawal, historicalSuccessRate } from "@/lib/calculations/withdrawal";
import { cn } from "@/lib/utils";

const STRATEGIES = [
  { id: "four_percent", label: "4% Rule", rate: 0.04, description: "Fixed 4% of initial portfolio, inflation-adjusted annually" },
  { id: "three_five", label: "3.5% Conservative", rate: 0.035, description: "More conservative for 40+ year retirements" },
  { id: "guardrails", label: "Guardrails (4.5%)", rate: 0.045, description: "Higher base rate with spending guardrails" },
];

interface WithdrawalInputs {
  portfolio: number;
  annualSpending: number;
  duration: number;
  returnRate: number;
}

const DEFAULT_INPUTS: WithdrawalInputs = {
  portfolio: 1000000,
  annualSpending: 40000,
  duration: 30,
  returnRate: 0.07,
};

export function WithdrawalClient(): React.JSX.Element {
  const [inputs, setInputs, clearInputs] = useLocalStorage<WithdrawalInputs>(
    "reachfire:withdrawal",
    DEFAULT_INPUTS
  );
  const { portfolio, annualSpending, duration, returnRate } = inputs;
  const setPortfolio = (v: number): void => setInputs((prev) => ({ ...prev, portfolio: v }));
  const setAnnualSpending = (v: number): void => setInputs((prev) => ({ ...prev, annualSpending: v }));
  const setDuration = (v: number): void => setInputs((prev) => ({ ...prev, duration: v }));
  const setReturnRate = (v: number): void => setInputs((prev) => ({ ...prev, returnRate: v }));
  const [selectedStrategy, setSelectedStrategy] = useState("four_percent");

  const strategy = STRATEGIES.find((s) => s.id === selectedStrategy) ?? STRATEGIES[0];

  const projection = useMemo(
    () => fixedWithdrawal(portfolio, strategy.rate, duration, returnRate, 0.03),
    [portfolio, strategy.rate, duration, returnRate]
  );

  const historicalRate = useMemo(
    () => historicalSuccessRate(portfolio, annualSpending, duration, 0.6),
    [portfolio, annualSpending, duration]
  );

  const survived = projection.every((y) => y.endBalance > 0);
  const finalBalance = projection[projection.length - 1]?.endBalance ?? 0;

  const chartData = projection.map((y) => ({
    year: y.year,
    balance: Math.round(y.endBalance),
    withdrawal: Math.round(y.inflationAdjustedWithdrawal),
  }));

  function formatMoney(v: number): string {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
    if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
    return `$${v}`;
  }

  const handleExportCSV = useCallback(() => {
    const headers = ["Year", "End Balance", "Inflation-Adj Withdrawal"];
    const rows = projection.map((y) => [
      y.year,
      Math.round(y.endBalance),
      Math.round(y.inflationAdjustedWithdrawal),
    ]);
    downloadCSV("reachfire-withdrawal", headers, rows);
  }, [projection]);

  const successColor =
    historicalRate >= 90 ? "text-emerald-400" : historicalRate >= 70 ? "text-amber-400" : "text-destructive";

  return (
    <PageEnter>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">Withdrawal Strategy Simulator</h1>
        <p className="text-muted-foreground max-w-2xl">
          Test different withdrawal strategies against historical market data spanning 100 years.
        </p>
        <ExportBar
          onExportCSV={handleExportCSV}
          onReset={clearInputs}
          className="no-print mt-3"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h2 className="font-semibold text-sm">Retirement Setup</h2>
            <CurrencyInput label="Starting Portfolio" value={portfolio} onChange={setPortfolio} />
            <CurrencyInput label="Annual Spending" value={annualSpending} onChange={setAnnualSpending} />
            <SliderInput label="Retirement Duration" value={duration} min={10} max={50} onChange={setDuration} format="years" />
            <SliderInput label="Expected Return" value={returnRate} min={0.02} max={0.12} step={0.005} onChange={setReturnRate} format="percent" />
          </div>

          {/* Strategy picker */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-2">
            <h2 className="font-semibold text-sm mb-3">Strategy</h2>
            {STRATEGIES.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedStrategy(s.id)}
                className={cn(
                  "w-full text-left p-3 rounded-lg text-xs transition-colors",
                  selectedStrategy === s.id
                    ? "bg-primary/15 border border-primary/30 text-primary"
                    : "bg-secondary/50 border border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <div className="font-medium">{s.label} ({(s.rate * 100).toFixed(1)}%)</div>
                <div className="text-muted-foreground mt-0.5">{s.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-5">
          {/* Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="col-span-2 sm:col-span-1 rounded-xl border border-border bg-card p-4 flex flex-col items-center justify-center py-6">
              <div className={cn("text-4xl font-bold", successColor)}>
                {historicalRate.toFixed(0)}%
              </div>
              <div className="text-xs text-muted-foreground mt-1 text-center">historical success rate</div>
              <div className="text-xs text-muted-foreground/60">across {duration}-yr periods since 1926</div>
            </div>
            <StatCard
              label="First Year Withdrawal"
              value={portfolio * strategy.rate}
              format="currency"
              subtitle={`${(strategy.rate * 100).toFixed(1)}% of portfolio`}
            />
            <StatCard
              label="Final Balance"
              value={finalBalance}
              format="currency"
              subtitle={survived ? "Portfolio survived" : "Portfolio depleted"}
              trend={survived ? "up" : "down"}
            />
            <StatCard
              label="Duration"
              value={duration}
              format="integer"
              suffix=" years"
              subtitle="Retirement length"
            />
          </div>

          {/* Chart */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold text-sm mb-4">Portfolio Balance Over {duration} Years</h2>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.70 0.24 50)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="oklch(0.70 0.24 50)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} tickFormatter={formatMoney} />
                <Tooltip formatter={(v: number | undefined) => v !== undefined ? formatMoney(v) : ""} contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <ReferenceLine y={0} stroke="oklch(0.52 0.18 250)" strokeWidth={1.5} />
                <Area type="monotone" dataKey="balance" stroke="oklch(0.70 0.24 50)" fill="url(#balGrad)" strokeWidth={2.5} name="Portfolio Balance" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Historical context */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold text-sm mb-2">Historical Context</h2>
            <p className="text-xs text-muted-foreground mb-4">
              Based on actual returns 1926–2024, 60/40 stock/bond allocation
            </p>
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="font-bold text-emerald-400">{historicalRate.toFixed(0)}%</div>
                <div className="text-xs text-muted-foreground mt-1">Success rate</div>
              </div>
              <div className="p-3 rounded-lg bg-secondary">
                <div className="font-bold">{(100 - historicalRate).toFixed(0)}%</div>
                <div className="text-xs text-muted-foreground mt-1">Failure rate</div>
              </div>
              <div className="p-3 rounded-lg bg-secondary">
                <div className="font-bold">{duration}yr</div>
                <div className="text-xs text-muted-foreground mt-1">Horizon tested</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              The classic Trinity Study (1998) found the 4% rule succeeded ~96% of the time over 30-year periods.
              Extending to 40+ years or using a higher withdrawal rate significantly reduces success probability.
            </p>
          </div>
        </div>
      </div>
      <DisclaimerBanner context="withdrawal" />
    </div>
    </PageEnter>
  );
}
