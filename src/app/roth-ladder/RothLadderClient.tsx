"use client";
import { PageEnter } from "@/components/Animated";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";

import { useMemo, useCallback } from "react";
import { CurrencyInput } from "@/components/CurrencyInput";
import { SliderInput } from "@/components/SliderInput";
import { StatCard } from "@/components/StatCard";
import { ExportBar } from "@/components/ExportBar";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { downloadCSV } from "@/lib/csv";
import { rothLadder } from "@/lib/calculations/tax";
import type { FilingStatus } from "@/types/fire";
import { cn } from "@/lib/utils";

const FILING_STATUSES: Array<{ value: FilingStatus; label: string }> = [
  { value: "single", label: "Single" },
  { value: "married_jointly", label: "Married Filing Jointly" },
  { value: "head_of_household", label: "Head of Household" },
];

const TARGET_BRACKETS = [
  { rate: 0.10, label: "10% bracket" },
  { rate: 0.12, label: "12% bracket (optimal for most)" },
  { rate: 0.22, label: "22% bracket" },
  { rate: 0.24, label: "24% bracket" },
];

interface RothLadderInputs {
  iraBalance: number;
  annualExpenses: number;
  currentAge: number;
  targetBracket: number;
  filingStatus: FilingStatus;
}

const DEFAULT_INPUTS: RothLadderInputs = {
  iraBalance: 300000,
  annualExpenses: 60000,
  currentAge: 40,
  targetBracket: 0.12,
  filingStatus: "single",
};

export function RothLadderClient(): React.JSX.Element {
  const [inputs, setInputs, clearInputs] = useLocalStorage<RothLadderInputs>(
    "reachfire:roth-ladder",
    DEFAULT_INPUTS
  );
  const { iraBalance, annualExpenses, currentAge, targetBracket, filingStatus } = inputs;
  const setIraBalance = (v: number): void => setInputs((prev) => ({ ...prev, iraBalance: v }));
  const setAnnualExpenses = (v: number): void => setInputs((prev) => ({ ...prev, annualExpenses: v }));
  const setCurrentAge = (v: number): void => setInputs((prev) => ({ ...prev, currentAge: v }));
  const setTargetBracket = (v: number): void => setInputs((prev) => ({ ...prev, targetBracket: v }));
  const setFilingStatus = (v: FilingStatus): void => setInputs((prev) => ({ ...prev, filingStatus: v }));

  const plan = useMemo(
    () => rothLadder(iraBalance, annualExpenses, targetBracket, filingStatus, currentAge, 0.07, 20),
    [iraBalance, annualExpenses, targetBracket, filingStatus, currentAge]
  );

  const handleExportCSV = useCallback(() => {
    const headers = ["Year", "Age", "Conversion Amount", "Tax on Conversion", "Available Year"];
    const rows = plan.rungs.map((rung) => [
      rung.conversionYear,
      rung.conversionAge,
      Math.round(rung.conversionAmount),
      Math.round(rung.taxOnConversion),
      rung.availableYear,
    ]);
    downloadCSV("reachfire-roth-ladder", headers, rows);
  }, [plan]);

  function formatMoney(v: number): string {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
    if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
    return `$${v.toFixed(0)}`;
  }

  return (
    <PageEnter>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">Roth Conversion Ladder</h1>
        <p className="text-muted-foreground max-w-2xl">
          The #1 FIRE tax strategy. Convert traditional IRA funds to Roth over 5 years — each &quot;rung&quot; becomes penalty-free after the 5-year seasoning period.
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
            <SliderInput label="Current Age" value={currentAge} min={25} max={60} onChange={setCurrentAge} />
            <CurrencyInput label="Traditional IRA/401k Balance" value={iraBalance} onChange={setIraBalance} />
            <CurrencyInput label="Annual Expenses in Retirement" value={annualExpenses} onChange={setAnnualExpenses} />

            <div className="space-y-2">
              <label className="text-sm font-medium">Filing Status</label>
              <div className="space-y-1.5">
                {FILING_STATUSES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setFilingStatus(s.value)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-xs transition-colors",
                      filingStatus === s.value
                        ? "bg-primary/15 border border-primary/30 text-primary"
                        : "bg-secondary/50 border border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Target Bracket</label>
              <div className="space-y-1.5">
                {TARGET_BRACKETS.map((b) => (
                  <button
                    key={b.rate}
                    onClick={() => setTargetBracket(b.rate)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-xs transition-colors",
                      targetBracket === b.rate
                        ? "bg-primary/15 border border-primary/30 text-primary"
                        : "bg-secondary/50 border border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-5">
          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatCard label="Total Tax Paid" value={plan.totalTaxPaid} format="currency" subtitle="On conversions" />
            <StatCard label="Tax Saved" value={plan.totalTaxSaved} format="currency" subtitle="vs no ladder" glow />
            <StatCard label="Bridge Fund Needed" value={plan.bridgeFundRequired} format="currency" subtitle="Taxable accounts" />
          </div>

          {/* Ladder visualization */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold text-sm mb-1">Conversion Ladder</h2>
            <p className="text-xs text-muted-foreground mb-4">
              Each rung converts IRA to Roth. After 5 years of &quot;seasoning,&quot; that rung is accessible penalty-free.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-muted-foreground font-medium">Year</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Age</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">Convert</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">Tax</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">Available</th>
                    <th className="text-left py-2 text-muted-foreground font-medium pl-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {plan.rungs.slice(0, 10).map((rung, i) => {
                    return (
                      <tr key={i} className="border-b border-border/30 hover:bg-accent/20">
                        <td className="py-2 tabular-nums">{rung.conversionYear}</td>
                        <td className="py-2 tabular-nums">{rung.conversionAge}</td>
                        <td className="py-2 text-right tabular-nums font-medium">{formatMoney(rung.conversionAmount)}</td>
                        <td className="py-2 text-right tabular-nums text-amber-400">{formatMoney(rung.taxOnConversion)}</td>
                        <td className="py-2 text-right tabular-nums text-muted-foreground">{rung.availableYear}</td>
                        <td className="py-2 pl-3">
                          <span className={cn(
                            "px-1.5 py-0.5 rounded text-xs",
                            i < 5
                              ? "bg-emerald-500/15 text-emerald-400"
                              : "bg-secondary text-muted-foreground"
                          )}>
                            {i < 5 ? "5-yr seasoning" : "Accessible"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* How it works */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold text-sm mb-3">How the Ladder Works</h2>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center shrink-0 font-bold">1</span>
                <p>Convert $X from Traditional IRA to Roth IRA each year before retiring (pay income tax now)</p>
              </div>
              <div className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center shrink-0 font-bold">2</span>
                <p>Each conversion &quot;seasons&quot; for 5 years — it cannot be withdrawn penalty-free before then</p>
              </div>
              <div className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center shrink-0 font-bold">3</span>
                <p>Meanwhile, live off your bridge fund (taxable accounts, cash) during the seasoning period</p>
              </div>
              <div className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center shrink-0 font-bold">4</span>
                <p>After year 5, withdraw from the first rung penalty-free — and repeat each year thereafter</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <DisclaimerBanner context="tax" />
    </div>
    </PageEnter>
  );
}
