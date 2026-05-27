"use client";
import { PageEnter } from "@/components/Animated";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { NextSteps } from "@/components/NextSteps";

import { useMemo, useCallback } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from "recharts";
import { CurrencyInput } from "@/components/CurrencyInput";
import { SliderInput } from "@/components/SliderInput";
import { StatCard } from "@/components/StatCard";
import { ProgressRing } from "@/components/ProgressRing";
import { ExportBar } from "@/components/ExportBar";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { downloadCSV } from "@/lib/csv";
import { analyzeCoastFire, bridgeFundNeeded, coastFireNumber } from "@/lib/calculations/coast";
import { projectedPortfolio } from "@/lib/calculations/core";

interface CoastInputs {
  currentAge: number;
  currentSavings: number;
  monthlySavings: number;
  targetRetirementAge: number;
  annualExpenses: number;
  returnRate: number;
}

const DEFAULT_INPUTS: CoastInputs = {
  currentAge: 30,
  currentSavings: 100000,
  monthlySavings: 3000,
  targetRetirementAge: 60,
  annualExpenses: 60000,
  returnRate: 0.07,
};

export function CoastClient(): React.JSX.Element {
  const [inputs, setInputs, clearInputs] = useLocalStorage<CoastInputs>(
    "reachfire:coast",
    DEFAULT_INPUTS
  );
  const { currentAge, currentSavings, monthlySavings, targetRetirementAge, annualExpenses, returnRate } = inputs;
  const setCurrentAge = (v: number): void => setInputs((prev) => ({ ...prev, currentAge: v }));
  const setCurrentSavings = (v: number): void => setInputs((prev) => ({ ...prev, currentSavings: v }));
  const setMonthlySavings = (v: number): void => setInputs((prev) => ({ ...prev, monthlySavings: v }));
  const setTargetRetirementAge = (v: number): void => setInputs((prev) => ({ ...prev, targetRetirementAge: v }));
  const setAnnualExpenses = (v: number): void => setInputs((prev) => ({ ...prev, annualExpenses: v }));
  const setReturnRate = (v: number): void => setInputs((prev) => ({ ...prev, returnRate: v }));

  const analysis = useMemo(
    () =>
      analyzeCoastFire(
        currentAge,
        currentSavings,
        monthlySavings,
        targetRetirementAge,
        annualExpenses,
        0.04,
        returnRate
      ),
    [currentAge, currentSavings, monthlySavings, targetRetirementAge, annualExpenses, returnRate]
  );

  const bridge = useMemo(
    () => bridgeFundNeeded(annualExpenses, Math.min(analysis.coastAge, 59.5), 59.5, 0.03, 0.05),
    [annualExpenses, analysis.coastAge]
  );

  // Build chart data
  const chartData = useMemo(() => {
    const data: Array<{
      age: number;
      portfolio: number;
      coastTarget: number;
      fireTarget: number;
    }> = [];

    for (let age = currentAge; age <= targetRetirementAge + 5; age++) {
      const yearsSaving = Math.min(age - currentAge, Math.max(0, analysis.coastAge - currentAge));
      const portfolioAtCoast = projectedPortfolio(currentSavings, monthlySavings, returnRate, yearsSaving);
      const yearsCoasting = Math.max(0, age - analysis.coastAge);
      const portfolio = portfolioAtCoast * Math.pow(1 + returnRate, yearsCoasting);

      const coastTarget = coastFireNumber(annualExpenses, age, targetRetirementAge, 0.04, returnRate);
      const fireTarget = annualExpenses * 25;

      data.push({ age, portfolio: Math.round(portfolio), coastTarget: Math.round(coastTarget), fireTarget });
    }
    return data;
  }, [currentAge, currentSavings, monthlySavings, returnRate, analysis.coastAge, targetRetirementAge, annualExpenses]);

  const handleExportCSV = useCallback(() => {
    const headers = ["Age", "Portfolio", "Coast Target", "FIRE Target"];
    const rows = chartData.map((d) => [d.age, d.portfolio, d.coastTarget, d.fireTarget]);
    downloadCSV("reachfire-coast", headers, rows);
  }, [chartData]);

  function formatMoney(v: number): string {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
    return `$${v}`;
  }

  return (
    <PageEnter>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">Coast FIRE Calculator</h1>
        <p className="text-muted-foreground max-w-2xl">
          Find the age when you can stop contributing to investments and let compound growth alone carry you to your FIRE number.
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
            <h2 className="font-semibold text-sm">Your Situation</h2>
            <SliderInput label="Current Age" value={currentAge} min={18} max={60} onChange={setCurrentAge} />
            <SliderInput label="Target Retirement Age" value={targetRetirementAge} min={currentAge + 5} max={75} onChange={setTargetRetirementAge} />
            <CurrencyInput label="Current Portfolio" value={currentSavings} onChange={setCurrentSavings} />
            <CurrencyInput label="Monthly Savings" value={monthlySavings} onChange={setMonthlySavings} />
            <CurrencyInput label="Annual Expenses (in retirement)" value={annualExpenses} onChange={setAnnualExpenses} />
            <SliderInput label="Expected Return" value={returnRate} min={0.03} max={0.12} step={0.005} onChange={setReturnRate} format="percent" />
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-5">
          {/* Key metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-ember bg-card p-4 glow-ember-sm col-span-2 sm:col-span-1 flex flex-col items-center justify-center py-6">
              <ProgressRing
                progress={analysis.currentProgress}
                size={90}
                label={`${analysis.currentProgress.toFixed(0)}%`}
                sublabel="to coast"
              />
            </div>
            <StatCard
              label="Coast Age"
              value={analysis.coastAge}
              format="integer"
              suffix=" yrs old"
              glow
              subtitle={`Save for ${analysis.yearsToCoastAge.toFixed(1)} more years`}
            />
            <StatCard
              label="Coast Number"
              value={analysis.coastNumber}
              format="currency"
              subtitle="Portfolio needed to coast"
            />
            <StatCard
              label="At Retirement"
              value={analysis.projectedRetirementPortfolio}
              format="currency"
              subtitle={`Projected at age ${targetRetirementAge}`}
            />
          </div>

          {/* Chart */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold text-sm mb-1">Portfolio Growth vs Coast Target</h2>
            <p className="text-xs text-muted-foreground mb-4">
              The inflection point shows where you can stop saving
            </p>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="portGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.70 0.24 50)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="oklch(0.70 0.24 50)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="age" tick={{ fontSize: 11 }} tickLine={false} label={{ value: "Age", position: "insideBottom", offset: -2, fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} tickFormatter={formatMoney} />
                <Tooltip formatter={(v: number | undefined) => v !== undefined ? formatMoney(v) : ""} contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <ReferenceLine x={Math.round(analysis.coastAge)} stroke="oklch(0.70 0.24 50)" strokeWidth={2} strokeDasharray="4 2" label={{ value: "Coast Age", position: "top", fontSize: 10, fill: "oklch(0.70 0.24 50)" }} />
                <Area type="monotone" dataKey="coastTarget" stroke="oklch(0.52 0.18 250)" strokeDasharray="5 3" fill="transparent" strokeWidth={1.5} name="Coast Number" />
                <Area type="monotone" dataKey="portfolio" stroke="oklch(0.70 0.24 50)" fill="url(#portGrad)" strokeWidth={2.5} name="Your Portfolio" />
                <Area type="monotone" dataKey="fireTarget" stroke="oklch(0.82 0.18 75)" strokeDasharray="4 2" fill="transparent" strokeWidth={1} name="Full FIRE Target" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Bridge fund */}
          {analysis.coastAge < 59.5 && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="font-semibold text-sm mb-2">Bridge Fund Required</h2>
              <p className="text-xs text-muted-foreground mb-3">
                You&apos;ll retire at {Math.round(analysis.coastAge)}, before the 59.5 penalty-free access age. You need accessible (non-retirement) funds to cover the gap.
              </p>
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-2xl font-bold">{formatMoney(bridge)}</span>
                  <span className="text-xs text-muted-foreground ml-2">bridge fund needed</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Covers {(59.5 - Math.min(analysis.coastAge, 59.5)).toFixed(1)} gap years in taxable accounts, brokerage, or cash
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    <NextSteps currentPath="/coast" />
    <DisclaimerBanner />
    </PageEnter>
  );
}
