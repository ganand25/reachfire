"use client";
import { PageEnter } from "@/components/Animated";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { NextSteps } from "@/components/NextSteps";

import { useMemo, useCallback } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { CurrencyInput } from "@/components/CurrencyInput";
import { SliderInput } from "@/components/SliderInput";
import { ExportBar } from "@/components/ExportBar";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { downloadCSV } from "@/lib/csv";
import {
  analyzeProperty,
  projectRentalFIRE,
  rentalImpactOnFIRE,
} from "@/lib/calculations/realEstate";
import { cn } from "@/lib/utils";

const METRIC_THRESHOLDS = {
  capRate: { good: 0.06, great: 0.08 },
  cashOnCash: { good: 0.05, great: 0.10 },
  grm: { good: 15, great: 10 }, // lower is better
};

function ratingColor(value: number, thresholds: { good: number; great: number }, lowerIsBetter = false): string {
  if (lowerIsBetter) {
    if (value <= thresholds.great) return "text-emerald-500";
    if (value <= thresholds.good) return "text-amber-500";
    return "text-red-500";
  }
  if (value >= thresholds.great) return "text-emerald-500";
  if (value >= thresholds.good) return "text-amber-500";
  return "text-red-500";
}

interface RealEstateInputs {
  purchasePrice: number;
  downPaymentPct: number;
  interestRate: number;
  monthlyRent: number;
  monthlyExpenses: number;
  annualAppreciation: number;
  currentPortfolio: number;
  monthlySavings: number;
  annualExpenses: number;
}

const DEFAULT_INPUTS: RealEstateInputs = {
  purchasePrice: 350000,
  downPaymentPct: 0.20,
  interestRate: 0.065,
  monthlyRent: 2200,
  monthlyExpenses: 600,
  annualAppreciation: 0.03,
  currentPortfolio: 200000,
  monthlySavings: 3000,
  annualExpenses: 72000,
};

export function RealEstateClient(): React.JSX.Element {
  const [inputs, setInputs, clearInputs] = useLocalStorage<RealEstateInputs>(
    "reachfire:real-estate",
    DEFAULT_INPUTS
  );
  const {
    purchasePrice, downPaymentPct, interestRate, monthlyRent,
    monthlyExpenses, annualAppreciation, currentPortfolio, monthlySavings, annualExpenses,
  } = inputs;
  const setPurchasePrice = (v: number): void => setInputs((prev) => ({ ...prev, purchasePrice: v }));
  const setDownPaymentPct = (v: number): void => setInputs((prev) => ({ ...prev, downPaymentPct: v }));
  const setInterestRate = (v: number): void => setInputs((prev) => ({ ...prev, interestRate: v }));
  const setMonthlyRent = (v: number): void => setInputs((prev) => ({ ...prev, monthlyRent: v }));
  const setMonthlyExpenses = (v: number): void => setInputs((prev) => ({ ...prev, monthlyExpenses: v }));
  const setAnnualAppreciation = (v: number): void => setInputs((prev) => ({ ...prev, annualAppreciation: v }));
  const setCurrentPortfolio = (v: number): void => setInputs((prev) => ({ ...prev, currentPortfolio: v }));
  const setMonthlySavings = (v: number): void => setInputs((prev) => ({ ...prev, monthlySavings: v }));
  const setAnnualExpenses = (v: number): void => setInputs((prev) => ({ ...prev, annualExpenses: v }));

  const property = useMemo(() => ({
    id: "primary",
    name: "Rental Property",
    purchasePrice,
    downPaymentPct,
    interestRate,
    loanTermYears: 30,
    monthlyRent,
    monthlyExpenses,
    annualAppreciation,
  }), [purchasePrice, downPaymentPct, interestRate, monthlyRent, monthlyExpenses, annualAppreciation]);

  const metrics = useMemo(() => analyzeProperty(property), [property]);

  const projections = useMemo(() => projectRentalFIRE(property, 30), [property]);

  const fireImpact = useMemo(
    () =>
      rentalImpactOnFIRE(
        Math.max(0, metrics.monthlyCashFlow),
        annualExpenses,
        currentPortfolio,
        monthlySavings,
        0.07
      ),
    [metrics.monthlyCashFlow, annualExpenses, currentPortfolio, monthlySavings]
  );

  const chartData = projections.map((p) => ({
    year: `Yr ${p.year}`,
    equity: p.equity,
    cashFlow: p.cumulativeCashFlow,
    rent: Math.round(p.annualRentalIncome / 12),
  }));

  const handleExportCSV = useCallback(() => {
    const headers = ["Year", "Equity", "Cumulative Cash Flow", "Monthly Rent"];
    const rows = chartData.map((d) => [d.year, d.equity, d.cashFlow, d.rent]);
    downloadCSV("reachfire-real-estate", headers, rows);
  }, [chartData]);

  function formatMoney(v: number): string {
    if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
    if (Math.abs(v) >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
    return `$${v}`;
  }

  const cashFlowPositive = metrics.monthlyCashFlow >= 0;

  return (
    <PageEnter>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
          Real Estate & Rental Income
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Analyze a rental property&apos;s returns and see how passive rental income accelerates
          your path to FIRE by reducing the portfolio you need.
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
            <h2 className="font-semibold text-sm">Property Details</h2>
            <CurrencyInput label="Purchase Price" value={purchasePrice} onChange={setPurchasePrice} />
            <SliderInput
              label="Down Payment"
              value={downPaymentPct}
              min={0.03}
              max={1.0}
              step={0.01}
              onChange={setDownPaymentPct}
              format="percent"
            />
            <SliderInput
              label="Mortgage Rate"
              value={interestRate}
              min={0.03}
              max={0.12}
              step={0.0025}
              onChange={setInterestRate}
              format="percent"
            />
            <CurrencyInput label="Monthly Rent" value={monthlyRent} onChange={setMonthlyRent} />
            <CurrencyInput
              label="Monthly Expenses (tax, ins, maintenance)"
              value={monthlyExpenses}
              onChange={setMonthlyExpenses}
            />
            <SliderInput
              label="Annual Appreciation"
              value={annualAppreciation}
              min={0}
              max={0.10}
              step={0.005}
              onChange={setAnnualAppreciation}
              format="percent"
            />
          </div>

          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h2 className="font-semibold text-sm">Your FIRE Context</h2>
            <CurrencyInput label="Current Portfolio" value={currentPortfolio} onChange={setCurrentPortfolio} />
            <CurrencyInput label="Monthly Savings" value={monthlySavings} onChange={setMonthlySavings} />
            <CurrencyInput label="Annual Expenses" value={annualExpenses} onChange={setAnnualExpenses} />
          </div>

          {/* FIRE impact card */}
          {cashFlowPositive && (
            <div className="rounded-xl border border-ember bg-card p-5 glow-ember-sm space-y-2">
              <h2 className="font-semibold text-sm gradient-ember-text">FIRE Impact</h2>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-muted-foreground">FIRE # without rental</div>
                  <div className="font-bold">{formatMoney(fireImpact.fireNumberWithout)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">FIRE # with rental</div>
                  <div className="font-bold text-emerald-500">{formatMoney(fireImpact.fireNumberWith)}</div>
                </div>
              </div>
              <div className="text-sm font-semibold text-emerald-500 mt-1">
                {Math.round(fireImpact.monthsEarlier / 12 * 10) / 10} years earlier to FIRE
              </div>
              <div className="text-xs text-muted-foreground">
                Portfolio savings: {formatMoney(fireImpact.portfolioSavings)}
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-5">
          {/* Key metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-border bg-card p-4 text-center">
              <div className={cn("text-2xl font-bold tabular-nums", ratingColor(metrics.capRate, METRIC_THRESHOLDS.capRate))}>
                {(metrics.capRate * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">Cap Rate</div>
              <div className="text-xs text-muted-foreground/60">NOI / price</div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 text-center">
              <div className={cn("text-2xl font-bold tabular-nums", ratingColor(metrics.cashOnCashReturn, METRIC_THRESHOLDS.cashOnCash))}>
                {(metrics.cashOnCashReturn * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">Cash-on-Cash</div>
              <div className="text-xs text-muted-foreground/60">cash flow / equity</div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 text-center">
              <div className={cn("text-2xl font-bold tabular-nums", ratingColor(metrics.grossRentMultiplier, METRIC_THRESHOLDS.grm, true))}>
                {metrics.grossRentMultiplier.toFixed(1)}x
              </div>
              <div className="text-xs text-muted-foreground mt-1">Gross Rent Mult.</div>
              <div className="text-xs text-muted-foreground/60">price / annual rent</div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 text-center">
              <div className={cn("text-2xl font-bold tabular-nums", (metrics.totalROI * 100) >= 10 ? "text-emerald-500" : "text-amber-500")}>
                {(metrics.totalROI * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">Total ROI</div>
              <div className="text-xs text-muted-foreground/60">cash+equity+apprec.</div>
            </div>
          </div>

          {/* Monthly breakdown */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold text-sm mb-4">Monthly Cash Flow Breakdown</h2>
            <div className="space-y-2 text-sm">
              {[
                { label: "Gross Rent", value: metrics.monthlyNOI + monthlyExpenses, color: "text-foreground" },
                { label: "Operating Expenses", value: -monthlyExpenses, color: "text-red-500" },
                { label: "Net Operating Income", value: metrics.monthlyNOI, color: "text-foreground", bold: true },
                { label: "Mortgage (P+I)", value: -metrics.monthlyMortgage, color: "text-red-500" },
              ].map((row) => (
                <div key={row.label} className={cn("flex justify-between py-1.5 border-b border-border/30", row.bold && "font-medium")}>
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className={row.color}>
                    {row.value >= 0 ? "+" : ""}${Math.abs(row.value).toLocaleString()}/mo
                  </span>
                </div>
              ))}
              <div className={cn(
                "flex justify-between py-2 rounded-lg px-3 font-bold",
                cashFlowPositive ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
              )}>
                <span>Monthly Cash Flow</span>
                <span>{metrics.monthlyCashFlow >= 0 ? "+" : ""}${metrics.monthlyCashFlow.toLocaleString()}/mo</span>
              </div>
              {metrics.breakEvenMonths > 0 && cashFlowPositive && (
                <div className="text-xs text-muted-foreground text-center pt-1">
                  Down payment recoups in ~{metrics.breakEvenMonths} months ({(metrics.breakEvenMonths / 12).toFixed(1)} years)
                </div>
              )}
            </div>
          </div>

          {/* 30-year equity + cash flow projection */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold text-sm mb-1">30-Year Equity Growth</h2>
            <p className="text-xs text-muted-foreground mb-4">
              Property equity (value − mortgage) + cumulative cash flow over time
            </p>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart
                data={chartData.filter((_, i) => i % 2 === 0 || i === chartData.length - 1)}
                margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.70 0.24 50)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="oklch(0.70 0.24 50)" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="cashGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.72 0.16 65)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.72 0.16 65)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="year" tick={{ fontSize: 10 }} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} tickFormatter={formatMoney} />
                <Tooltip
                  formatter={(v: number | undefined) => v !== undefined ? formatMoney(v) : ""}
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="equity" name="Property Equity" stroke="oklch(0.70 0.24 50)" fill="url(#equityGrad)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="cashFlow" name="Cumulative Cash Flow" stroke="oklch(0.72 0.16 65)" fill="url(#cashGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly rent growth */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold text-sm mb-4">Monthly Rent Growth ({(annualAppreciation * 70).toFixed(0)}% rent appreciation)</h2>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart
                data={chartData.filter((_, i) => [0, 4, 9, 14, 19, 24, 29].includes(i))}
                margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="year" tick={{ fontSize: 10 }} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} tickFormatter={(v: number) => `$${v}`} />
                <Tooltip
                  formatter={(v: number | undefined) => v !== undefined ? [`$${v}/mo`, "Monthly Rent"] : ""}
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="rent" name="Monthly Rent" fill="oklch(0.70 0.24 50)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Key ratios guide */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold text-sm mb-3">How to Read the Metrics</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-muted-foreground">
              <div className="p-3 rounded-lg bg-secondary/50">
                <div className="font-medium text-foreground mb-1">Cap Rate</div>
                <div className="space-y-0.5">
                  <div><span className="text-emerald-500">≥8%</span> — Great deal</div>
                  <div><span className="text-amber-500">6-8%</span> — Good</div>
                  <div><span className="text-red-500">&lt;6%</span> — Weak returns</div>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50">
                <div className="font-medium text-foreground mb-1">Cash-on-Cash</div>
                <div className="space-y-0.5">
                  <div><span className="text-emerald-500">≥10%</span> — Excellent</div>
                  <div><span className="text-amber-500">5-10%</span> — Solid</div>
                  <div><span className="text-red-500">&lt;5%</span> — Low cash yield</div>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50">
                <div className="font-medium text-foreground mb-1">Gross Rent Mult.</div>
                <div className="space-y-0.5">
                  <div><span className="text-emerald-500">≤10x</span> — Great buy</div>
                  <div><span className="text-amber-500">10-15x</span> — OK</div>
                  <div><span className="text-red-500">&gt;15x</span> — Overpriced</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <NextSteps currentPath="/real-estate" />
    <DisclaimerBanner />
    </PageEnter>
  );
}
