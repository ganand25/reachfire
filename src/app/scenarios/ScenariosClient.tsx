"use client";
import { PageEnter } from "@/components/Animated";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { NextSteps } from "@/components/NextSteps";

import { useMemo, useCallback } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CurrencyInput } from "@/components/CurrencyInput";
import { SliderInput } from "@/components/SliderInput";
import { ComparisonBar } from "@/components/ComparisonBar";
import { ExportBar } from "@/components/ExportBar";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { downloadCSV } from "@/lib/csv";
import { fireNumber, yearsToFire } from "@/lib/calculations/core";
import { cn } from "@/lib/utils";

interface ScenarioDefinition {
  key: string;
  name: string;
  color: string;
  expenseMultiplier: number;
  withdrawalRate: number;
  description: string;
  lifestyle: string;
  calcHref: string;
}

const SCENARIOS: ScenarioDefinition[] = [
  {
    key: "lean",
    name: "Lean FIRE",
    color: "text-amber-400",
    expenseMultiplier: 0.7,
    withdrawalRate: 0.04,
    description: "Live frugally, maximize freedom. 70% of current expenses.",
    lifestyle: "Minimalist · Frugal · Geographic flexibility",
    calcHref: "/calculator?wr=0.04",
  },
  {
    key: "regular",
    name: "Regular FIRE",
    color: "text-orange-400",
    expenseMultiplier: 1.0,
    withdrawalRate: 0.04,
    description: "Maintain your current lifestyle in retirement.",
    lifestyle: "Current lifestyle preserved",
    calcHref: "/calculator",
  },
  {
    key: "fat",
    name: "Fat FIRE",
    color: "text-yellow-300",
    expenseMultiplier: 1.5,
    withdrawalRate: 0.04,
    description: "Retire rich. 150% of current expenses — travel, luxury, anything.",
    lifestyle: "Upgraded · Travel · Generous",
    calcHref: "/calculator?wr=0.04",
  },
  {
    key: "coast",
    name: "Coast FIRE",
    color: "text-sky-400",
    expenseMultiplier: 1.0,
    withdrawalRate: 0.04,
    description: "Save hard now, stop contributing, let compounding do the rest.",
    lifestyle: "Save aggressively early · Coast to retirement",
    calcHref: "/coast",
  },
  {
    key: "barista",
    name: "Barista FIRE",
    color: "text-green-400",
    expenseMultiplier: 0.6,
    withdrawalRate: 0.04,
    description: "Semi-retire. Portfolio covers 60% of expenses, part-time covers the rest.",
    lifestyle: "Part-time income · Reduced stress · Flexibility",
    calcHref: "/calculator",
  },
];

interface ScenariosInputs {
  annualExpenses: number;
  currentPortfolio: number;
  monthlySavings: number;
  returnRate: number;
}

const DEFAULT_INPUTS: ScenariosInputs = {
  annualExpenses: 60000,
  currentPortfolio: 50000,
  monthlySavings: 2000,
  returnRate: 0.07,
};

export function ScenariosClient(): React.JSX.Element {
  const [inputs, setInputs, clearInputs] = useLocalStorage<ScenariosInputs>(
    "reachfire:scenarios",
    DEFAULT_INPUTS
  );
  const { annualExpenses, currentPortfolio, monthlySavings, returnRate } = inputs;
  const setAnnualExpenses = (v: number): void => setInputs((prev) => ({ ...prev, annualExpenses: v }));
  const setCurrentPortfolio = (v: number): void => setInputs((prev) => ({ ...prev, currentPortfolio: v }));
  const setMonthlySavings = (v: number): void => setInputs((prev) => ({ ...prev, monthlySavings: v }));
  const setReturnRate = (v: number): void => setInputs((prev) => ({ ...prev, returnRate: v }));

  const scenarios = useMemo(() => {
    return SCENARIOS.map((s) => {
      const expenses = annualExpenses * s.expenseMultiplier;
      const fireNum = fireNumber(expenses, s.withdrawalRate);
      const years = yearsToFire(currentPortfolio, monthlySavings, returnRate, fireNum);
      const progress = Math.min(100, (currentPortfolio / fireNum) * 100);

      return {
        ...s,
        adjustedExpenses: expenses,
        fireNumber: fireNum,
        yearsToFire: years,
        progress,
      };
    });
  }, [annualExpenses, currentPortfolio, monthlySavings, returnRate]);

  const handleExportCSV = useCallback(() => {
    const headers = ["Scenario", "Adjusted Expenses", "FIRE Number", "Years to FIRE", "Progress %"];
    const rows = scenarios.map((s) => [
      s.name,
      Math.round(s.adjustedExpenses),
      Math.round(s.fireNumber),
      s.yearsToFire === Infinity ? "Infinity" : s.yearsToFire.toFixed(1),
      s.progress.toFixed(1),
    ]);
    downloadCSV("reachfire-scenarios", headers, rows);
  }, [scenarios]);

  return (
    <PageEnter>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">Scenario Comparison</h1>
        <p className="text-muted-foreground">
          Compare all FIRE types side by side with your real numbers.
        </p>
        <ExportBar
          onExportCSV={handleExportCSV}
          onReset={clearInputs}
          className="no-print mt-3"
        />
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 p-5 rounded-xl border border-border bg-card">
        <CurrencyInput
          label="Annual Expenses"
          value={annualExpenses}
          onChange={setAnnualExpenses}
        />
        <CurrencyInput
          label="Current Portfolio"
          value={currentPortfolio}
          onChange={setCurrentPortfolio}
        />
        <CurrencyInput
          label="Monthly Savings"
          value={monthlySavings}
          onChange={setMonthlySavings}
        />
        <SliderInput
          label="Return Rate"
          value={returnRate}
          min={0.01}
          max={0.15}
          step={0.005}
          onChange={setReturnRate}
          format="percent"
        />
      </div>

      {/* Scenarios table */}
      <div className="space-y-4 mb-10">
        {scenarios.map((s) => (
          <div
            key={s.key}
            className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={cn("font-bold", s.color)}>{s.name}</h3>
                  <span className="text-xs text-muted-foreground">{s.lifestyle}</span>
                </div>
                <p className="text-sm text-muted-foreground">{s.description}</p>
              </div>

              <div className="grid grid-cols-3 gap-4 sm:gap-6 text-sm">
                <div className="text-center">
                  <div className="font-bold tabular-nums">
                    ${(s.fireNumber / 1_000_000).toFixed(2)}M
                  </div>
                  <div className="text-xs text-muted-foreground">FIRE #</div>
                </div>
                <div className="text-center">
                  <div className="font-bold tabular-nums">
                    {s.yearsToFire === Infinity ? "∞" : s.yearsToFire.toFixed(1)} yrs
                  </div>
                  <div className="text-xs text-muted-foreground">to FIRE</div>
                </div>
                <div className="text-center">
                  <div className={cn("font-bold tabular-nums", s.color)}>
                    {s.progress.toFixed(0)}%
                  </div>
                  <div className="text-xs text-muted-foreground">there</div>
                </div>
              </div>

              <Link
                href={s.calcHref}
                className="flex items-center gap-1 text-xs text-primary hover:underline whitespace-nowrap"
              >
                Open tool
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Progress bar */}
            <div className="mt-4 h-1.5 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full gradient-ember transition-all duration-700"
                style={{ width: `${s.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Comparison chart */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-base font-semibold mb-4">FIRE Number Comparison</h2>
        <ComparisonBar
          items={scenarios.map((s, i) => ({
            label: s.name,
            value: s.fireNumber,
            sublabel: `${s.yearsToFire === Infinity ? "∞" : s.yearsToFire.toFixed(1)} yrs`,
            highlighted: i === 1, // Regular FIRE highlighted
          }))}
          format="currency"
        />

        <div className="mt-6 pt-6 border-t border-border/50">
          <h2 className="text-base font-semibold mb-4">Years to Each FIRE Type</h2>
          <ComparisonBar
            items={scenarios.filter((s) => s.yearsToFire < Infinity).map((s, i) => ({
              label: s.name,
              value: s.yearsToFire,
              sublabel: `$${(s.fireNumber / 1_000).toFixed(0)}K target`,
              highlighted: i === 0, // Fastest (lowest years)
            }))}
            format="years"
          />
        </div>
      </div>
    </div>
    <NextSteps currentPath="/scenarios" />
    <DisclaimerBanner />
    </PageEnter>
  );
}
