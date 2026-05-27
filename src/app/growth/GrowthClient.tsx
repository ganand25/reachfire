"use client";
import { PageEnter } from "@/components/Animated";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { NextSteps } from "@/components/NextSteps";

import { useMemo, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend,
} from "recharts";
import { CurrencyInput } from "@/components/CurrencyInput";
import { SliderInput } from "@/components/SliderInput";
import { StatCard } from "@/components/StatCard";
import { ExportBar } from "@/components/ExportBar";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { downloadCSV } from "@/lib/csv";
import { projectedGrowth, yearsToDouble } from "@/lib/calculations/core";

interface GrowthInputs {
  initialInvestment: number;
  monthlyContribution: number;
  returnRate: number;
  years: number;
}

const DEFAULT_INPUTS: GrowthInputs = {
  initialInvestment: 10000,
  monthlyContribution: 1000,
  returnRate: 0.07,
  years: 30,
};

export function GrowthClient(): React.JSX.Element {
  const [inputs, setInputs, clearInputs] = useLocalStorage<GrowthInputs>(
    "reachfire:growth",
    DEFAULT_INPUTS
  );
  const { initialInvestment, monthlyContribution, returnRate, years } = inputs;
  const setInitialInvestment = (v: number): void => setInputs((prev) => ({ ...prev, initialInvestment: v }));
  const setMonthlyContribution = (v: number): void => setInputs((prev) => ({ ...prev, monthlyContribution: v }));
  const setReturnRate = (v: number): void => setInputs((prev) => ({ ...prev, returnRate: v }));
  const setYears = (v: number): void => setInputs((prev) => ({ ...prev, years: v }));

  const projections = useMemo(
    () => projectedGrowth(initialInvestment, monthlyContribution, returnRate, years, 0.03, 30),
    [initialInvestment, monthlyContribution, returnRate, years]
  );

  const doublingYears = yearsToDouble(returnRate);
  const finalValue = projections[projections.length - 1]?.portfolioValue ?? 0;
  const totalContributions = initialInvestment + monthlyContribution * 12 * years;
  const totalGrowth = finalValue - totalContributions;

  const chartData = projections.map((p) => ({
    year: p.year,
    contributions: Math.round(initialInvestment + monthlyContribution * 12 * p.year),
    growth: Math.round(p.portfolioValue - (initialInvestment + monthlyContribution * 12 * p.year)),
  }));

  const handleExportCSV = useCallback(() => {
    const headers = ["Year", "Contributions", "Growth", "Total"];
    const rows = chartData.map((d) => [d.year, d.contributions, d.growth, d.contributions + d.growth]);
    downloadCSV("reachfire-growth", headers, rows);
  }, [chartData]);

  function formatMoney(v: number): string {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
    if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
    return `$${v.toFixed(0)}`;
  }

  // Find the "hockey stick" — first year where growth > contributions
  const hockeyStickYear = chartData.findIndex((d) => d.growth > d.contributions);

  return (
    <PageEnter>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">Investment Growth Visualizer</h1>
        <p className="text-muted-foreground max-w-2xl">
          Compound interest is the 8th wonder of the world — and the hockey stick moment is when the market works harder for you than you do.
        </p>
        <ExportBar
          onExportCSV={handleExportCSV}
          onReset={clearInputs}
          className="no-print mt-3"
        />
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-5 rounded-xl border border-border bg-card">
        <CurrencyInput label="Initial Investment" value={initialInvestment} onChange={setInitialInvestment} />
        <CurrencyInput label="Monthly Contribution" value={monthlyContribution} onChange={setMonthlyContribution} />
        <SliderInput label="Expected Return" value={returnRate} min={0.01} max={0.15} step={0.005} onChange={setReturnRate} format="percent" />
        <SliderInput label="Years" value={years} min={5} max={50} onChange={setYears} format="years" />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard label="Final Value" value={finalValue} format="currency" glow />
        <StatCard label="Your Money" value={totalContributions} format="currency" subtitle="Total contributions" />
        <StatCard label="Market Growth" value={totalGrowth} format="currency" subtitle="Interest earned" trend="up" />
        <div className="rounded-xl border border-border bg-card p-4 flex flex-col justify-center">
          <p className="text-sm text-muted-foreground mb-1">Money doubles every</p>
          <p className="text-2xl font-bold">{doublingYears.toFixed(1)} yrs</p>
          <p className="text-xs text-muted-foreground">Rule of 72 at {(returnRate * 100).toFixed(1)}%</p>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-border bg-card p-5 mb-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-sm">Contributions vs Market Growth</h2>
          {hockeyStickYear > 0 && (
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              🏒 Hockey stick at year {hockeyStickYear + 1}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Gray = your contributions · Ember = market doing the work for you
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="year" tick={{ fontSize: 11 }} tickLine={false} label={{ value: "Year", position: "insideBottom", offset: -2, fontSize: 11 }} />
            <YAxis tick={{ fontSize: 10 }} tickLine={false} tickFormatter={formatMoney} />
            <Tooltip formatter={(v: number | undefined) => v !== undefined ? formatMoney(v) : ""} contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            <Bar dataKey="contributions" stackId="a" fill="oklch(0.35 0.01 260)" name="Your Contributions" radius={[0, 0, 0, 0]} />
            <Bar dataKey="growth" stackId="a" name="Market Growth" radius={[3, 3, 0, 0]}>
              {chartData.map((_, i) => (
                <Cell
                  key={i}
                  fill={`oklch(${0.62 + (i / chartData.length) * 0.2} ${0.26 - (i / chartData.length) * 0.08} ${35 + (i / chartData.length) * 40})`}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Milestones */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-semibold text-sm mb-3">Key Milestones</h2>
        <div className="space-y-2">
          {[100000, 500000, 1000000].map((milestone) => {
            const milestoneYear = projections.findIndex((p) => p.portfolioValue >= milestone);
            return (
              <div key={milestone} className="flex items-center justify-between text-sm py-2 border-b border-border/30 last:border-0">
                <span className="text-muted-foreground">Reach {formatMoney(milestone)}</span>
                <span className="font-semibold">
                  {milestoneYear >= 0 ? `Year ${milestoneYear + 1}` : "Not within timeframe"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
    <NextSteps currentPath="/growth" />
    <DisclaimerBanner />
    </PageEnter>
  );
}
