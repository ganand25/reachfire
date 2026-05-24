"use client";

import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { PageEnter } from "@/components/Animated";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { CurrencyInput } from "@/components/CurrencyInput";
import { SliderInput } from "@/components/SliderInput";
import { StatCard } from "@/components/StatCard";
import { cn } from "@/lib/utils";
import type { RetirementInputs, TaxTip } from "@/types/retirement";
import { runAllStrategies, generateTaxTips, generateBestStrategyPlan } from "@/services/withdrawal-optimizer";
import {
  Shield,
  TrendingDown,
  ArrowDownRight,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  Info,
  Gift,
  DollarSign,
  Zap,
} from "lucide-react";

function formatMoney(v: number): string {
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${Math.round(v).toLocaleString()}`;
}

function formatPercent(v: number): string {
  return `${(v * 100).toFixed(1)}%`;
}

const STRATEGY_DESCRIPTIONS: Record<string, string> = {
  conventional: "Worst for taxes — drains Traditional first, pushing you into higher brackets early.",
  "tax-optimized": "Best overall — fills low brackets strategically, uses 0% LTCG window, converts to Roth.",
  "roth-ladder": "Best if early retirement — lives off taxable, converts Traditional to Roth aggressively.",
  proportional: "Simple but suboptimal — ignores bracket optimization entirely.",
};

export function RetirementClient(): React.JSX.Element {
  const [inputs, setInputs] = useState<RetirementInputs>({
    currentAge: 35,
    retirementAge: 55,
    lifeExpectancy: 90,
    filingStatus: "single",
    traditionalBalance: 500000,
    rothBalance: 200000,
    taxableBalance: 300000,
    taxableCostBasisPercent: 60,
    annualTraditionalContribution: 23500,
    annualRothContribution: 7000,
    annualTaxableContribution: 12000,
    annualAdditionalIncome: 0,
    contributionOverrides: {},
    annualExpenses: 60000,
    growthRate: 0.07,
    inflationRate: 0.03,
    socialSecurityMonthly: 2000,
    socialSecurityAge: 67,
  });

  const [selectedStrategy, setSelectedStrategy] = useState("tax-optimized");
  const [showTable, setShowTable] = useState(false);
  const [showAccumulation, setShowAccumulation] = useState(true);
  const [showBestPlan, setShowBestPlan] = useState(false);
  const [activeView, setActiveView] = useState<"balances" | "taxes">("balances");

  function update<K extends keyof RetirementInputs>(key: K, value: RetirementInputs[K]): void {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  function updateContributionOverride(age: number, field: "traditional" | "roth" | "taxable" | "additionalIncome", value: number): void {
    setInputs((prev) => {
      const overrides = { ...prev.contributionOverrides };
      const existing = overrides[age] ?? {};
      overrides[age] = { ...existing, [field]: value };
      return { ...prev, contributionOverrides: overrides };
    });
  }

  function resetContributionOverride(age: number, field: "traditional" | "roth" | "taxable" | "additionalIncome"): void {
    setInputs((prev) => {
      const overrides = { ...prev.contributionOverrides };
      if (overrides[age]) {
        const updated = { ...overrides[age] };
        delete updated[field];
        if (Object.keys(updated).length === 0) {
          delete overrides[age];
        } else {
          overrides[age] = updated;
        }
      }
      return { ...prev, contributionOverrides: overrides };
    });
  }

  const strategies = useMemo(() => runAllStrategies(inputs), [inputs]);
  const tips = useMemo(() => generateTaxTips(inputs, strategies), [inputs, strategies]);
  const bestPlan = useMemo(() => generateBestStrategyPlan(inputs, strategies), [inputs, strategies]);

  const selected = strategies.find((s) => s.id === selectedStrategy) ?? strategies[0];
  const conventional = strategies.find((s) => s.id === "conventional");
  const bestStrategy = strategies.reduce((a, b) => (a.totalTaxes < b.totalTaxes ? a : b));
  const worstStrategy = strategies.reduce((a, b) => (a.totalTaxes > b.totalTaxes ? a : b));
  const maxSavings = worstStrategy.totalTaxes - bestStrategy.totalTaxes;

  const balanceChartData = selected.years.map((y) => ({
    age: y.age,
    Traditional: Math.round(y.traditionalBalance),
    Roth: Math.round(y.rothBalance),
    Taxable: Math.round(y.taxableBalance),
  }));

  const taxComparisonData = strategies.map((s) => ({
    name: s.name,
    taxes: Math.round(s.totalTaxes),
    rate: s.effectiveLifetimeRate,
  }));

  const yearlyTaxData = selected.years.filter((_, i) => i % 2 === 0).map((y) => ({
    age: y.age,
    "Federal Tax": Math.round(y.federalTax),
    "LTCG Tax": Math.round(y.ltcgTax),
  }));

  return (
    <PageEnter>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
            Retirement Tax Optimizer
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Compare withdrawal strategies to minimize lifetime taxes. See exactly how much you save
            by withdrawing from the right accounts in the right order.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ── Inputs Panel ── */}
          <div className="lg:col-span-4 space-y-4">
            {/* Personal */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <h2 className="font-semibold text-sm flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" />
                Personal Details
              </h2>
              <SliderInput
                label="Current Age"
                value={inputs.currentAge}
                min={20}
                max={70}
                onChange={(v) => update("currentAge", v)}
                format="years"
              />
              <SliderInput
                label="Retirement Age"
                value={inputs.retirementAge}
                min={Math.max(inputs.currentAge + 1, 30)}
                max={75}
                onChange={(v) => update("retirementAge", v)}
                format="years"
              />
              <SliderInput
                label="Life Expectancy"
                value={inputs.lifeExpectancy}
                min={inputs.retirementAge + 5}
                max={100}
                onChange={(v) => update("lifeExpectancy", v)}
                format="years"
              />
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Filing Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["single", "married"] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => update("filingStatus", status)}
                      className={cn(
                        "px-3 py-2 rounded-lg border text-sm font-medium transition-all",
                        inputs.filingStatus === status
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-foreground/30"
                      )}
                    >
                      {status === "single" ? "Single" : "Married"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Account Balances */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <h2 className="font-semibold text-sm flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                Account Balances
              </h2>
              <CurrencyInput
                label="Traditional 401k/IRA"
                value={inputs.traditionalBalance}
                onChange={(v) => update("traditionalBalance", v)}
                hint="Pre-tax — withdrawals taxed as ordinary income"
              />
              <CurrencyInput
                label="Roth IRA/401k"
                value={inputs.rothBalance}
                onChange={(v) => update("rothBalance", v)}
                hint="Post-tax — qualified withdrawals are tax-free"
              />
              <CurrencyInput
                label="Taxable Brokerage"
                value={inputs.taxableBalance}
                onChange={(v) => update("taxableBalance", v)}
                hint="Investment account — only gains are taxed"
              />
              <SliderInput
                label="Cost Basis %"
                value={inputs.taxableCostBasisPercent}
                min={10}
                max={100}
                onChange={(v) => update("taxableCostBasisPercent", v)}
                format="number"
                hint="What % of your brokerage is original investment (not gains)"
              />
            </div>

            {/* Annual Contributions */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <h2 className="font-semibold text-sm flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-primary rotate-180" />
                Annual Contributions
              </h2>
              <p className="text-xs text-muted-foreground">How much you add each year until retirement</p>
              <CurrencyInput
                label="Traditional 401k/IRA"
                value={inputs.annualTraditionalContribution}
                onChange={(v) => update("annualTraditionalContribution", v)}
                hint="2025 limit: $23,500 (401k) + $7,000 (IRA)"
              />
              <CurrencyInput
                label="Roth IRA/401k"
                value={inputs.annualRothContribution}
                onChange={(v) => update("annualRothContribution", v)}
                hint="2025 limit: $7,000 (IRA) or $23,500 (Roth 401k)"
              />
              <CurrencyInput
                label="Taxable Brokerage"
                value={inputs.annualTaxableContribution}
                onChange={(v) => update("annualTaxableContribution", v)}
                hint="No contribution limits"
              />
              <CurrencyInput
                label="Additional Income (invested)"
                value={inputs.annualAdditionalIncome}
                onChange={(v) => update("annualAdditionalIncome", v)}
                hint="Rental, side hustle, bonus — goes into taxable brokerage"
              />
              {selected.balanceAtRetirement.total > 0 && (
                <div className="rounded-lg bg-muted/50 p-3 space-y-1.5">
                  <p className="text-xs font-semibold text-foreground">Projected at retirement (age {inputs.retirementAge})</p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Traditional</p>
                      <p className="font-semibold tabular-nums">{formatMoney(selected.balanceAtRetirement.traditional)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Roth</p>
                      <p className="font-semibold tabular-nums">{formatMoney(selected.balanceAtRetirement.roth)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Taxable</p>
                      <p className="font-semibold tabular-nums">{formatMoney(selected.balanceAtRetirement.taxable)}</p>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-primary tabular-nums">
                    Total: {formatMoney(selected.balanceAtRetirement.total)}
                  </p>
                </div>
              )}
            </div>

            {/* Assumptions */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <h2 className="font-semibold text-sm">Assumptions</h2>
              <CurrencyInput
                label="Annual Expenses (today's dollars)"
                value={inputs.annualExpenses}
                onChange={(v) => update("annualExpenses", v)}
              />
              <SliderInput
                label="Growth Rate"
                value={inputs.growthRate}
                min={0.03}
                max={0.12}
                step={0.005}
                onChange={(v) => update("growthRate", v)}
                format="percent"
              />
              <SliderInput
                label="Inflation Rate"
                value={inputs.inflationRate}
                min={0.01}
                max={0.06}
                step={0.005}
                onChange={(v) => update("inflationRate", v)}
                format="percent"
              />
              <CurrencyInput
                label="Social Security (monthly)"
                value={inputs.socialSecurityMonthly}
                onChange={(v) => update("socialSecurityMonthly", v)}
                hint="Expected monthly benefit in today's dollars"
              />
              <SliderInput
                label="SS Claiming Age"
                value={inputs.socialSecurityAge}
                min={62}
                max={70}
                onChange={(v) => update("socialSecurityAge", v)}
                format="years"
              />
            </div>
          </div>

          {/* ── Results Panel ── */}
          <div className="lg:col-span-8 space-y-6">
            {/* Headline savings + Best Strategy button */}
            {maxSavings > 0 && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-lg">
                      Save up to{" "}
                      <span className="text-emerald-400">{formatMoney(maxSavings)}</span>{" "}
                      in lifetime taxes
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      The <strong>{bestStrategy.name}</strong> strategy pays{" "}
                      {formatMoney(bestStrategy.totalTaxes)} in total taxes vs.{" "}
                      {formatMoney(worstStrategy.totalTaxes)} with the{" "}
                      {worstStrategy.name} approach.
                    </p>
                    <button
                      onClick={() => {
                        setSelectedStrategy(bestPlan.strategyId);
                        setShowBestPlan(true);
                      }}
                      className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg gradient-ember text-white font-semibold text-sm shadow-md hover:opacity-90 transition-opacity glow-ember-sm"
                    >
                      <Zap className="w-4 h-4" />
                      Show Best Strategy Plan
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Best Strategy Detailed Plan */}
            {showBestPlan && (
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-lg flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    Your Best Strategy: {bestPlan.strategyName}
                  </h2>
                  <button
                    onClick={() => setShowBestPlan(false)}
                    className="text-muted-foreground hover:text-foreground text-sm"
                  >
                    Close
                  </button>
                </div>

                <div className="rounded-lg bg-card border border-border p-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">{bestPlan.whyBest}</p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-2xl font-bold text-emerald-400">{formatMoney(bestPlan.totalSavings)}</span>
                    <span className="text-sm text-muted-foreground">saved vs worst strategy</span>
                  </div>
                </div>

                {/* Phased Action Plan */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Action Plan by Phase</h3>
                  {bestPlan.phases.map((phase) => (
                    <div key={phase.title} className="rounded-lg border border-border bg-card p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm">{phase.title}</h4>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                          Ages {phase.ageRange}
                        </span>
                      </div>
                      <ul className="space-y-1.5">
                        {phase.actions.map((action, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* First 5 Years Breakdown */}
                <div>
                  <h3 className="font-semibold text-sm mb-2">First 5 Years Breakdown</h3>
                  <div className="rounded-lg border border-border bg-card overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border bg-muted/30">
                          <th className="px-3 py-2 text-left font-medium text-muted-foreground">Age</th>
                          <th className="px-3 py-2 text-right font-medium text-muted-foreground">Traditional</th>
                          <th className="px-3 py-2 text-right font-medium text-muted-foreground">Roth</th>
                          <th className="px-3 py-2 text-right font-medium text-muted-foreground">Taxable</th>
                          <th className="px-3 py-2 text-right font-medium text-muted-foreground">Conversion</th>
                          <th className="px-3 py-2 text-right font-medium text-muted-foreground">Tax</th>
                          <th className="px-3 py-2 text-right font-medium text-muted-foreground">Bracket</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bestPlan.firstFiveYears.map((y) => (
                          <tr key={y.age} className="border-b border-border/50">
                            <td className="px-3 py-1.5 font-medium">{y.age}</td>
                            <td className="px-3 py-1.5 text-right tabular-nums">
                              {y.traditionalWithdraw > 0 ? formatMoney(y.traditionalWithdraw) : "—"}
                            </td>
                            <td className="px-3 py-1.5 text-right tabular-nums">
                              {y.rothWithdraw > 0 ? formatMoney(y.rothWithdraw) : "—"}
                            </td>
                            <td className="px-3 py-1.5 text-right tabular-nums">
                              {y.taxableWithdraw > 0 ? formatMoney(y.taxableWithdraw) : "—"}
                            </td>
                            <td className="px-3 py-1.5 text-right tabular-nums text-primary">
                              {y.rothConversion > 0 ? formatMoney(y.rothConversion) : "—"}
                            </td>
                            <td className="px-3 py-1.5 text-right tabular-nums text-destructive">
                              {formatMoney(y.tax)}
                            </td>
                            <td className="px-3 py-1.5 text-right tabular-nums">{y.bracket}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* vs Other Strategies */}
                <div>
                  <h3 className="font-semibold text-sm mb-2">Savings vs Other Strategies</h3>
                  <div className="space-y-2">
                    {bestPlan.comparisonVsOthers.map((c) => (
                      <div key={c.name} className="flex items-center justify-between text-sm rounded-lg border border-border bg-card px-4 py-2.5">
                        <span className="text-muted-foreground">{c.name}</span>
                        <span className="font-semibold text-emerald-400">
                          +{formatMoney(c.yourSavings)} saved
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Strategy Comparison Cards */}
            <div>
              <h2 className="font-semibold text-sm mb-3">Compare Strategies</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {strategies.map((s) => {
                  const isBest = s.id === bestStrategy.id;
                  const savingsVsWorst = worstStrategy.totalTaxes - s.totalTaxes;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedStrategy(s.id)}
                      className={cn(
                        "relative text-left rounded-xl border p-4 transition-all",
                        selectedStrategy === s.id
                          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                          : "border-border bg-card hover:border-foreground/20"
                      )}
                    >
                      {isBest && (
                        <span className="absolute top-3 right-3 text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-medium">
                          LOWEST TAX
                        </span>
                      )}
                      <h3 className="font-semibold text-sm mb-1">{s.name}</h3>
                      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                        {STRATEGY_DESCRIPTIONS[s.id]}
                      </p>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Lifetime taxes</p>
                          <p className="text-lg font-bold tabular-nums">{formatMoney(s.totalTaxes)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Effective rate</p>
                          <p className="text-sm font-semibold tabular-nums">
                            {formatPercent(s.effectiveLifetimeRate)}
                          </p>
                        </div>
                      </div>
                      {savingsVsWorst > 0 && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-emerald-400">
                          <ArrowDownRight className="w-3 h-3" />
                          Saves {formatMoney(savingsVsWorst)} vs worst
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard
                label="Lifetime Taxes"
                value={selected.totalTaxes}
                format="currency"
                size="sm"
              />
              <StatCard
                label="Effective Rate"
                value={selected.effectiveLifetimeRate * 100}
                format="decimal"
                decimals={1}
                suffix="%"
                size="sm"
              />
              <StatCard
                label="Money Lasts Until"
                value={selected.accountsLastUntilAge}
                format="integer"
                suffix=" yrs"
                size="sm"
              />
              <StatCard
                label={conventional ? "Tax Savings" : "Total Withdrawn"}
                value={
                  conventional
                    ? Math.max(0, conventional.totalTaxes - selected.totalTaxes)
                    : selected.totalWithdrawals
                }
                format="currency"
                size="sm"
                trend={
                  conventional && conventional.totalTaxes - selected.totalTaxes > 0
                    ? "up"
                    : "neutral"
                }
              />
            </div>

            {/* Chart Toggle */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="font-semibold text-sm">Projections</h2>
                <div className="flex rounded-lg border border-border overflow-hidden ml-auto">
                  {(["balances", "taxes"] as const).map((view) => (
                    <button
                      key={view}
                      onClick={() => setActiveView(view)}
                      className={cn(
                        "px-3 py-1 text-xs font-medium transition-colors",
                        activeView === view
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {view === "balances" ? "Account Balances" : "Yearly Taxes"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-4">
                {activeView === "balances" ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={balanceChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis
                        dataKey="age"
                        tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                        label={{ value: "Age", position: "insideBottom", offset: -5, fontSize: 11, fill: "var(--muted-foreground)" }}
                      />
                      <YAxis
                        tickFormatter={(v: number) => formatMoney(v)}
                        tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                        width={65}
                      />
                      <Tooltip
                        formatter={(v: number | undefined) => v !== undefined ? formatMoney(v) : ""}
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: "12px" }} />
                      <Area
                        type="monotone"
                        dataKey="Traditional"
                        stackId="1"
                        stroke="oklch(0.65 0.20 15)"
                        fill="oklch(0.65 0.20 15 / 0.5)"
                      />
                      <Area
                        type="monotone"
                        dataKey="Roth"
                        stackId="1"
                        stroke="oklch(0.72 0.20 145)"
                        fill="oklch(0.72 0.20 145 / 0.5)"
                      />
                      <Area
                        type="monotone"
                        dataKey="Taxable"
                        stackId="1"
                        stroke="oklch(0.68 0.18 260)"
                        fill="oklch(0.68 0.18 260 / 0.5)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={yearlyTaxData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis
                        dataKey="age"
                        tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                        label={{ value: "Age", position: "insideBottom", offset: -5, fontSize: 11, fill: "var(--muted-foreground)" }}
                      />
                      <YAxis
                        tickFormatter={(v: number) => formatMoney(v)}
                        tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                        width={65}
                      />
                      <Tooltip
                        formatter={(v: number | undefined) => v !== undefined ? formatMoney(v) : ""}
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: "12px" }} />
                      <Bar dataKey="Federal Tax" stackId="a" fill="oklch(0.65 0.20 15 / 0.7)" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="LTCG Tax" stackId="a" fill="oklch(0.68 0.18 260 / 0.7)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Lifetime Tax Comparison Bar Chart */}
            <div>
              <h2 className="font-semibold text-sm mb-3">Lifetime Tax Comparison</h2>
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="space-y-3">
                  {taxComparisonData.map((d) => {
                    const maxTax = Math.max(...taxComparisonData.map((x) => x.taxes));
                    const pct = maxTax > 0 ? (d.taxes / maxTax) * 100 : 0;
                    const isBest = d.taxes === Math.min(...taxComparisonData.map((x) => x.taxes));
                    return (
                      <div key={d.name} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className={cn("font-medium", isBest && "text-emerald-400")}>
                            {d.name}
                            {isBest && " *"}
                          </span>
                          <span className="tabular-nums font-semibold">{formatMoney(d.taxes)}</span>
                        </div>
                        <div className="h-3 rounded-full bg-secondary overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              isBest ? "bg-emerald-500" : "bg-primary/60"
                            )}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Tax Saving Tips */}
            <div>
              <h2 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                Tax-Saving Strategies
              </h2>
              <div className="space-y-3">
                {tips.map((tip, i) => (
                  <TipCard key={i} tip={tip} />
                ))}
              </div>
            </div>

            {/* Editable Accumulation Table */}
            <div>
              <button
                onClick={() => setShowAccumulation(!showAccumulation)}
                className="flex items-center gap-2 text-sm font-semibold hover:text-primary transition-colors"
              >
                Pre-Retirement Contributions (Editable)
                {showAccumulation ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showAccumulation && selected.accumulation.length > 0 && (
                <div className="mt-3 rounded-xl border border-border bg-card overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Age</th>
                        <th className="px-3 py-2 text-right font-medium text-muted-foreground">Trad Contrib</th>
                        <th className="px-3 py-2 text-right font-medium text-muted-foreground">Roth Contrib</th>
                        <th className="px-3 py-2 text-right font-medium text-muted-foreground">Taxable Contrib</th>
                        <th className="px-3 py-2 text-right font-medium text-muted-foreground">Add&apos;l Income</th>
                        <th className="px-3 py-2 text-right font-medium text-muted-foreground">Trad Balance</th>
                        <th className="px-3 py-2 text-right font-medium text-muted-foreground">Roth Balance</th>
                        <th className="px-3 py-2 text-right font-medium text-muted-foreground">Taxable Balance</th>
                        <th className="px-3 py-2 text-right font-medium text-muted-foreground">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selected.accumulation.map((y) => {
                        const hasOverride = inputs.contributionOverrides[y.age];
                        return (
                          <tr
                            key={y.age}
                            className={cn(
                              "border-b border-border/50 hover:bg-muted/20 transition-colors",
                              hasOverride && "bg-primary/5"
                            )}
                          >
                            <td className="px-3 py-1.5 font-medium">{y.age}</td>
                            <EditableCell
                              value={y.traditionalContribution}
                              isOverridden={hasOverride?.traditional !== undefined}
                              onChange={(v) => updateContributionOverride(y.age, "traditional", v)}
                              onReset={() => resetContributionOverride(y.age, "traditional")}
                            />
                            <EditableCell
                              value={y.rothContribution}
                              isOverridden={hasOverride?.roth !== undefined}
                              onChange={(v) => updateContributionOverride(y.age, "roth", v)}
                              onReset={() => resetContributionOverride(y.age, "roth")}
                            />
                            <EditableCell
                              value={y.taxableContribution}
                              isOverridden={hasOverride?.taxable !== undefined}
                              onChange={(v) => updateContributionOverride(y.age, "taxable", v)}
                              onReset={() => resetContributionOverride(y.age, "taxable")}
                            />
                            <EditableCell
                              value={y.additionalIncome}
                              isOverridden={hasOverride?.additionalIncome !== undefined}
                              onChange={(v) => updateContributionOverride(y.age, "additionalIncome", v)}
                              onReset={() => resetContributionOverride(y.age, "additionalIncome")}
                            />
                            <td className="px-3 py-1.5 text-right tabular-nums">{formatMoney(y.traditionalBalance)}</td>
                            <td className="px-3 py-1.5 text-right tabular-nums">{formatMoney(y.rothBalance)}</td>
                            <td className="px-3 py-1.5 text-right tabular-nums">{formatMoney(y.taxableBalance)}</td>
                            <td className="px-3 py-1.5 text-right tabular-nums font-semibold">{formatMoney(y.totalBalance)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Year-by-Year Table */}
            <div>
              <button
                onClick={() => setShowTable(!showTable)}
                className="flex items-center gap-2 text-sm font-semibold hover:text-primary transition-colors"
              >
                Withdrawal Year-by-Year Breakdown
                {showTable ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showTable && (
                <div className="mt-3 rounded-xl border border-border bg-card overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Age</th>
                        <th className="px-3 py-2 text-right font-medium text-muted-foreground">Traditional</th>
                        <th className="px-3 py-2 text-right font-medium text-muted-foreground">Roth</th>
                        <th className="px-3 py-2 text-right font-medium text-muted-foreground">Taxable</th>
                        <th className="px-3 py-2 text-right font-medium text-muted-foreground">Conversion</th>
                        <th className="px-3 py-2 text-right font-medium text-muted-foreground">SS</th>
                        <th className="px-3 py-2 text-right font-medium text-muted-foreground">Tax</th>
                        <th className="px-3 py-2 text-right font-medium text-muted-foreground">Rate</th>
                        <th className="px-3 py-2 text-right font-medium text-muted-foreground">Net</th>
                        <th className="px-3 py-2 text-right font-medium text-muted-foreground">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selected.years.map((y) => (
                        <tr
                          key={y.age}
                          className={cn(
                            "border-b border-border/50 hover:bg-muted/20 transition-colors",
                            y.rmdRequired > 0 && "bg-amber-500/5",
                            y.totalBalance <= 0 && "bg-destructive/5"
                          )}
                        >
                          <td className="px-3 py-1.5 font-medium">
                            {y.age}
                            {y.rmdRequired > 0 && (
                              <span className="ml-1 text-[10px] text-amber-400">RMD</span>
                            )}
                          </td>
                          <td className="px-3 py-1.5 text-right tabular-nums">
                            {y.traditionalWithdrawal > 0 ? formatMoney(y.traditionalWithdrawal) : "—"}
                          </td>
                          <td className="px-3 py-1.5 text-right tabular-nums">
                            {y.rothWithdrawal > 0 ? formatMoney(y.rothWithdrawal) : "—"}
                          </td>
                          <td className="px-3 py-1.5 text-right tabular-nums">
                            {y.taxableWithdrawal > 0 ? formatMoney(y.taxableWithdrawal) : "—"}
                          </td>
                          <td className="px-3 py-1.5 text-right tabular-nums text-primary">
                            {y.rothConversion > 0 ? formatMoney(y.rothConversion) : "—"}
                          </td>
                          <td className="px-3 py-1.5 text-right tabular-nums">
                            {y.socialSecurityIncome > 0 ? formatMoney(y.socialSecurityIncome) : "—"}
                          </td>
                          <td className="px-3 py-1.5 text-right tabular-nums font-medium text-destructive">
                            {y.totalTax > 0 ? formatMoney(y.totalTax) : "$0"}
                          </td>
                          <td className="px-3 py-1.5 text-right tabular-nums">
                            {formatPercent(y.effectiveRate)}
                          </td>
                          <td className="px-3 py-1.5 text-right tabular-nums">
                            {formatMoney(y.netSpending)}
                          </td>
                          <td className="px-3 py-1.5 text-right tabular-nums font-medium">
                            {formatMoney(y.totalBalance)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-muted/30 font-semibold">
                        <td className="px-3 py-2">Total</td>
                        <td className="px-3 py-2 text-right tabular-nums">
                          {formatMoney(selected.years.reduce((s, y) => s + y.traditionalWithdrawal, 0))}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums">
                          {formatMoney(selected.years.reduce((s, y) => s + y.rothWithdrawal, 0))}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums">
                          {formatMoney(selected.years.reduce((s, y) => s + y.taxableWithdrawal, 0))}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-primary">
                          {formatMoney(selected.years.reduce((s, y) => s + y.rothConversion, 0))}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums">
                          {formatMoney(selected.years.reduce((s, y) => s + y.socialSecurityIncome, 0))}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-destructive">
                          {formatMoney(selected.totalTaxes)}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums">
                          {formatPercent(selected.effectiveLifetimeRate)}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums">
                          {formatMoney(selected.years.reduce((s, y) => s + y.netSpending, 0))}
                        </td>
                        <td className="px-3 py-2"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>

            {/* How It Works */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <h2 className="font-semibold text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                How Tax-Optimized Withdrawal Works
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground text-sm">The Problem</h3>
                  <p>
                    Most retirees withdraw from Traditional accounts first, pushing themselves into
                    high tax brackets early — then sit on tax-free Roth money they don&apos;t need.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground text-sm">The Solution</h3>
                  <ul className="space-y-1.5">
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
                      Withdraw Traditional up to the 12% bracket ceiling
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
                      Sell taxable investments at 0% LTCG when income is low
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
                      Convert Traditional to Roth in remaining bracket space
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
                      Use Roth as a tax-free buffer for spending spikes
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
                      Reduce RMD shock at age 73 by converting early
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Gift Tax & Estate Section */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <h2 className="font-semibold text-sm flex items-center gap-2">
                <Gift className="w-4 h-4 text-primary" />
                Gift & Estate Tax Strategies
              </h2>
              <div className="text-xs text-muted-foreground space-y-2">
                <p>
                  <strong className="text-foreground">Annual Gift Exclusion:</strong> Give up to
                  $19,000 per person per year (2025) without any gift tax or reporting.
                  Married couples can give $38,000 per recipient.
                </p>
                <p>
                  <strong className="text-foreground">Gift Appreciated Stock:</strong> Transfer
                  appreciated shares to family members in lower tax brackets. They inherit your
                  cost basis but may pay 0% LTCG if their income is low enough.
                </p>
                <p>
                  <strong className="text-foreground">Roth for Heirs:</strong> Roth accounts
                  pass tax-free to beneficiaries. Prioritizing Roth conversions now means your
                  heirs receive tax-free money (they must withdraw within 10 years under SECURE Act).
                </p>
                <p>
                  <strong className="text-foreground">Step-Up in Basis:</strong> Taxable
                  investments get a stepped-up cost basis at death, wiping out all unrealized
                  gains. Consider holding highly appreciated taxable assets if estate transfer
                  is a goal.
                </p>
              </div>
            </div>

            <DisclaimerBanner />
          </div>
        </div>
      </div>
    </PageEnter>
  );
}

function EditableCell({
  value,
  isOverridden,
  onChange,
  onReset,
}: {
  value: number;
  isOverridden: boolean;
  onChange: (v: number) => void;
  onReset: () => void;
}): React.JSX.Element {
  const [editing, setEditing] = useState(false);
  const [raw, setRaw] = useState("");

  function startEdit(): void {
    setRaw(String(Math.round(value)));
    setEditing(true);
  }

  function commitEdit(): void {
    setEditing(false);
    const parsed = parseInt(raw.replace(/[^0-9]/g, ""), 10);
    if (!isNaN(parsed)) {
      onChange(parsed);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent): void {
    if (e.key === "Enter") commitEdit();
    if (e.key === "Escape") setEditing(false);
  }

  if (editing) {
    return (
      <td className="px-1 py-0.5">
        <input
          autoFocus
          type="text"
          inputMode="numeric"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleKeyDown}
          className="w-full px-2 py-1 text-xs text-right tabular-nums rounded border border-primary bg-background outline-none"
        />
      </td>
    );
  }

  return (
    <td
      className={cn(
        "px-3 py-1.5 text-right tabular-nums cursor-pointer hover:bg-primary/10 transition-colors group",
        isOverridden && "text-primary font-semibold"
      )}
      onClick={startEdit}
    >
      <span className="relative">
        {formatMoney(value)}
        {isOverridden && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReset();
            }}
            className="ml-1 text-[10px] text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
            title="Reset to default"
          >
            x
          </button>
        )}
      </span>
    </td>
  );
}

function TipCard({ tip }: { tip: TaxTip }): React.JSX.Element {
  const icons = {
    high: <AlertTriangle className="w-4 h-4 text-amber-400" />,
    medium: <Info className="w-4 h-4 text-blue-400" />,
    low: <Gift className="w-4 h-4 text-muted-foreground" />,
  };
  const borders = {
    high: "border-amber-500/20 bg-amber-500/5",
    medium: "border-blue-500/20 bg-blue-500/5",
    low: "border-border bg-card",
  };

  return (
    <div className={cn("rounded-xl border p-4", borders[tip.priority])}>
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5">{icons[tip.priority]}</div>
        <div>
          <p className="font-semibold text-sm mb-0.5">{tip.title}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{tip.description}</p>
          {tip.savings !== null && tip.savings > 0 && (
            <p className="text-xs font-semibold text-emerald-400 mt-1">
              Potential savings: {formatMoney(tip.savings)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
