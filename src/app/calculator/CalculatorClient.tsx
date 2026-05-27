"use client";

import { useState, useCallback, useMemo } from "react";
import { ExportBar } from "@/components/ExportBar";
import { downloadCSV } from "@/lib/csv";
import { useSearchParams } from "next/navigation";
import { ChevronDown, ChevronUp, Play, Shield } from "lucide-react";
import { useFireCalculator } from "@/hooks/useFireCalculator";
import { decodeShareParams } from "@/components/ShareButton";
import { PageEnter } from "@/components/Animated";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { NextSteps } from "@/components/NextSteps";
import { SliderInput } from "@/components/SliderInput";
import { CurrencyInput } from "@/components/CurrencyInput";
import { StatCard } from "@/components/StatCard";
import { ProjectionChart } from "@/components/ProjectionChart";
import { MonteCarloChart } from "@/components/MonteCarloChart";
import { ProgressRing } from "@/components/ProgressRing";
import { FireScore, calculateFireScore } from "@/components/FireScore";
import { ShareButton } from "@/components/ShareButton";
import { cn } from "@/lib/utils";

// AI Insights feature — temporarily disabled, kept for future use
// interface AIInsight {
//   id: string;
//   text: string;
// }

const WITHDRAWAL_STRATEGIES = [
  { value: "four_percent", label: "4% Rule", description: "Classic: 4% of portfolio annually" },
  { value: "three_five_percent", label: "3.5% Conservative", description: "Safer for long retirements" },
  { value: "variable_percentage", label: "Variable %", description: "Adjusts based on performance" },
  { value: "guardrails", label: "Guardrails", description: "Spending guardrails strategy" },
];

export function CalculatorClient(): React.JSX.Element {
  const searchParams = useSearchParams();

  const initialInputs = useMemo(() => {
    const raw = decodeShareParams(searchParams.toString());
    if (Object.keys(raw).length === 0) return undefined;
    return {
      ...(raw.age !== undefined ? { currentAge: Number(raw.age) } : {}),
      ...(raw.income !== undefined ? { annualGrossIncome: Number(raw.income) } : {}),
      ...(raw.expenses !== undefined ? { annualExpenses: Number(raw.expenses) } : {}),
      ...(raw.portfolio !== undefined ? { currentPortfolio: Number(raw.portfolio) } : {}),
      ...(raw.savings !== undefined ? { monthlySavings: Number(raw.savings) } : {}),
      ...(raw.ret !== undefined ? { expectedReturnRate: Number(raw.ret) } : {}),
      ...(raw.inf !== undefined ? { inflationRate: Number(raw.inf) } : {}),
      ...(raw.wr !== undefined ? { withdrawalRate: Number(raw.wr) } : {}),
    };
  }, [searchParams]);

  const { inputs, result, monteCarloResult, setInput, runMonteCarloSim, isRunningMonteCarlo, clearInputs } =
    useFireCalculator({ initialInputs, storageKey: "reachfire:calculator" });
  const [inputsPanelOpen, setInputsPanelOpen] = useState(true);
  const [showInflationAdj, setShowInflationAdj] = useState(false);

  // AI Insights feature — temporarily disabled, kept for future use
  // const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  // const [aiLoading, setAiLoading] = useState(false);
  // const [aiError, setAiError] = useState<string | null>(null);
  // const [dismissedInsights, setDismissedInsights] = useState<Set<string>>(new Set());

  const progress = Math.min(100, (inputs.currentPortfolio / result.fireNumber) * 100);
  const fireDateDisplay =
    result.yearsToFire === Infinity
      ? "Unknown"
      : result.fireDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const fireScore = calculateFireScore({
    savingsRate: result.savingsRate,
    hasEmergencyFund: inputs.currentPortfolio >= inputs.annualExpenses * 0.5,
    debtToIncomeRatio: 0,
    progressToFireNumber: progress / 100,
    diversified: true,
  });

  const handleExportCSV = useCallback(() => {
    const headers = ["Year", "Age", "Portfolio Value", "Contributions", "Growth", "Inflation-Adjusted"];
    const rows = result.projections.map((p) => [
      p.year,
      p.age,
      Math.round(p.portfolioValue),
      Math.round(p.contributions),
      Math.round(p.growthAmount),
      Math.round(p.inflationAdjusted),
    ]);
    downloadCSV("reachfire-calculator", headers, rows);
  }, [result.projections]);

  const handleStrategyChange = useCallback(
    (strategy: string) => {
      const rateMap: Record<string, number> = {
        four_percent: 0.04,
        three_five_percent: 0.035,
        variable_percentage: 0.04,
        guardrails: 0.04,
      };
      setInput("withdrawalRate", rateMap[strategy] ?? 0.04);
    },
    [setInput]
  );

  // AI Insights feature — temporarily disabled, kept for future use
  // const handleGetInsights = useCallback(async () => {
  //   setAiLoading(true);
  //   setAiError(null);
  //   try {
  //     const response = await fetch("/api/insights", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         currentAge: inputs.currentAge,
  //         savingsRate: result.savingsRate,
  //         yearsToFire: result.yearsToFire,
  //         fireNumber: result.fireNumber,
  //         currentPortfolio: inputs.currentPortfolio,
  //         annualExpenses: inputs.annualExpenses,
  //         annualIncome: inputs.annualGrossIncome,
  //         monthlySavings: inputs.monthlySavings,
  //         expectedReturn: inputs.expectedReturnRate,
  //         withdrawalRate: inputs.withdrawalRate,
  //       }),
  //     });
  //
  //     const data = (await response.json()) as { insights?: AIInsight[]; error?: string };
  //
  //     if (!response.ok) {
  //       throw new Error(data.error ?? "Failed to get insights");
  //     }
  //
  //     setAiInsights(data.insights ?? []);
  //   } catch (err) {
  //     setAiError(err instanceof Error ? err.message : "Failed to get AI insights");
  //   } finally {
  //     setAiLoading(false);
  //   }
  // }, [inputs, result]);
  //
  // const handleDismissInsight = useCallback((id: string) => {
  //   setDismissedInsights((prev) => new Set([...prev, id]));
  // }, []);
  //
  // const visibleInsights = aiInsights.filter((i) => !dismissedInsights.has(i.id));

  return (
    <PageEnter>
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold font-display">FIRE Calculator</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Live projections · Monte Carlo · AI insights
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ExportBar
                onExportCSV={handleExportCSV}
                onReset={clearInputs}
                className="no-print"
              />
              <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Private — data stays in your browser</span>
              </div>
              <ShareButton
                params={{
                  age: inputs.currentAge,
                  income: inputs.annualGrossIncome,
                  expenses: inputs.annualExpenses,
                  portfolio: inputs.currentPortfolio,
                  savings: inputs.monthlySavings,
                  ret: inputs.expectedReturnRate,
                  inf: inputs.inflationRate,
                  wr: inputs.withdrawalRate,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* === INPUT PANEL === */}
          <aside className="w-full lg:w-80 shrink-0">
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <button
                onClick={() => setInputsPanelOpen(!inputsPanelOpen)}
                className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold hover:bg-accent/30 transition-colors"
              >
                <span>Your Numbers</span>
                {inputsPanelOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {inputsPanelOpen && (
                <div className="px-5 pb-5 space-y-5 border-t border-border/50">
                  {/* Age */}
                  <div className="pt-4 space-y-4">
                    <SliderInput
                      label="Current Age"
                      value={inputs.currentAge}
                      min={18}
                      max={70}
                      onChange={(v) => setInput("currentAge", v)}
                      format="years"
                    />
                    <SliderInput
                      label="Target Retirement Age"
                      value={inputs.targetRetirementAge}
                      min={inputs.currentAge + 1}
                      max={80}
                      onChange={(v) => setInput("targetRetirementAge", v)}
                      format="years"
                    />
                  </div>

                  <hr className="border-border/50" />

                  {/* Income & Expenses */}
                  <div className="space-y-3">
                    <CurrencyInput
                      label="Annual Income (gross)"
                      value={inputs.annualGrossIncome}
                      onChange={(v) => setInput("annualGrossIncome", v)}
                      hint="Your total pre-tax income"
                    />
                    <CurrencyInput
                      label="Annual Expenses"
                      value={inputs.annualExpenses}
                      onChange={(v) => setInput("annualExpenses", v)}
                      hint="What you spend per year"
                    />
                    <CurrencyInput
                      label="Current Portfolio"
                      value={inputs.currentPortfolio}
                      onChange={(v) => setInput("currentPortfolio", v)}
                      hint="Investments + retirement accounts"
                    />
                    <CurrencyInput
                      label="Monthly Savings"
                      value={inputs.monthlySavings}
                      onChange={(v) => setInput("monthlySavings", v)}
                      hint="Amount you invest each month"
                    />
                  </div>

                  <hr className="border-border/50" />

                  {/* Rates */}
                  <div className="space-y-4">
                    <SliderInput
                      label="Expected Return"
                      value={inputs.expectedReturnRate}
                      min={0.01}
                      max={0.15}
                      step={0.005}
                      onChange={(v) => setInput("expectedReturnRate", v)}
                      format="percent"
                      hint="S&P 500 historical avg: ~10% (7% inflation-adj)"
                    />
                    <SliderInput
                      label="Inflation Rate"
                      value={inputs.inflationRate}
                      min={0.01}
                      max={0.08}
                      step={0.005}
                      onChange={(v) => setInput("inflationRate", v)}
                      format="percent"
                      hint="US 20-yr avg: ~2.7%"
                    />
                  </div>

                  <hr className="border-border/50" />

                  {/* Withdrawal Strategy */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Withdrawal Strategy</label>
                    <div className="space-y-1.5">
                      {WITHDRAWAL_STRATEGIES.map((strategy) => {
                        const isSelected =
                          (strategy.value === "four_percent" && inputs.withdrawalRate === 0.04) ||
                          (strategy.value === "three_five_percent" && inputs.withdrawalRate === 0.035);
                        return (
                          <button
                            key={strategy.value}
                            onClick={() => handleStrategyChange(strategy.value)}
                            className={cn(
                              "w-full text-left px-3 py-2 rounded-lg text-xs transition-colors",
                              isSelected
                                ? "bg-primary/15 border border-primary/30 text-primary"
                                : "bg-secondary/50 border border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary"
                            )}
                          >
                            <div className="font-medium">{strategy.label}</div>
                            <div className="text-muted-foreground mt-0.5">{strategy.description}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* FIRE Score */}
            <div className="mt-4 rounded-xl border border-border bg-card p-5 flex items-center gap-4">
              <FireScore score={fireScore} />
              <div className="flex-1">
                <p className="text-sm font-semibold">FIRE Score</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Based on savings rate, progress, and financial health
                </p>
              </div>
            </div>
          </aside>

          {/* === DASHBOARD === */}
          <div className="flex-1 min-w-0 space-y-5">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard
                label="FIRE Number"
                value={result.fireNumber}
                format="currency"
                glow
                size="md"
                subtitle={`${(inputs.withdrawalRate * 100).toFixed(1)}× rule`}
                className="col-span-1"
              />
              <StatCard
                label="Years to FIRE"
                value={result.yearsToFire === Infinity ? 0 : result.yearsToFire}
                format="decimal"
                decimals={1}
                suffix=" yrs"
                size="md"
                subtitle={fireDateDisplay}
              />
              <StatCard
                label="Savings Rate"
                value={result.savingsRate}
                format="decimal"
                decimals={1}
                suffix="%"
                size="md"
                subtitle={
                  result.savingsRate >= 50
                    ? "Excellent — top 5%"
                    : result.savingsRate >= 30
                    ? "Strong — keep going"
                    : "Aim for 30%+"
                }
                trend={result.savingsRate >= 30 ? "up" : "neutral"}
              />
              <div className="rounded-xl border border-border bg-card p-4 flex flex-col items-center justify-center">
                <ProgressRing
                  progress={progress}
                  size={88}
                  strokeWidth={8}
                  label={`${progress.toFixed(0)}%`}
                  sublabel="to FIRE"
                />
              </div>
            </div>

            {/* Projection Chart */}
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-semibold">Portfolio Projection</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Nominal growth at {(inputs.expectedReturnRate * 100).toFixed(1)}% return</p>
                </div>
                <button
                  onClick={() => setShowInflationAdj(!showInflationAdj)}
                  className={cn(
                    "text-xs px-2.5 py-1 rounded-md border transition-colors",
                    showInflationAdj
                      ? "border-primary text-primary bg-primary/10"
                      : "border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {showInflationAdj ? "Real $" : "Show real $"}
                </button>
              </div>
              <ProjectionChart
                projections={result.projections}
                fireNumber={result.fireNumber}
                leanFireNumber={result.leanFireNumber}
                fatFireNumber={result.fatFireNumber}
                showInflationAdjusted={showInflationAdj}
              />
            </div>

            {/* Extra context row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs text-muted-foreground mb-1">Lean FIRE</p>
                <p className="text-lg font-bold tabular-nums">
                  ${(result.leanFireNumber / 1_000_000).toFixed(2)}M
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">70% of current expenses</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 border-ember glow-ember-sm">
                <p className="text-xs text-muted-foreground mb-1">Regular FIRE</p>
                <p className="text-lg font-bold tabular-nums gradient-ember-text">
                  ${(result.fireNumber / 1_000_000).toFixed(2)}M
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Current lifestyle</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs text-muted-foreground mb-1">Fat FIRE</p>
                <p className="text-lg font-bold tabular-nums">
                  ${(result.fatFireNumber / 1_000_000).toFixed(2)}M
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">150% of current expenses</p>
              </div>
            </div>

            {/* Monte Carlo */}
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-semibold">Monte Carlo Simulation</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    1,000 simulations with randomized market returns
                  </p>
                </div>
                {!monteCarloResult && (
                  <button
                    onClick={runMonteCarloSim}
                    disabled={isRunningMonteCarlo}
                    className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg gradient-ember text-white hover:opacity-90 transition-opacity disabled:opacity-60"
                  >
                    <Play className="w-3.5 h-3.5" />
                    {isRunningMonteCarlo ? "Running…" : "Run Simulation"}
                  </button>
                )}
              </div>

              {monteCarloResult ? (
                <MonteCarloChart
                  result={monteCarloResult}
                  years={Math.ceil(result.yearsToFire) + 30}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Play className="w-10 h-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Run 1,000 market simulations to see your probability of success
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Uses log-normal return distribution based on historical S&P 500 volatility
                  </p>
                </div>
              )}
            </div>

            {/* AI Insights — Coming Soon */}
            <div className="rounded-xl border border-border/50 bg-card/50 p-5">
              <div className="flex items-center justify-center py-8">
                <p className="text-base font-medium text-foreground/70">
                  🔒 AI-Powered Insights — Coming Soon
                </p>
              </div>
            </div>

            {/* Disclaimer */}
            <NextSteps currentPath="/calculator" />
            <DisclaimerBanner />
          </div>
        </div>
      </div>
    </div>
    </PageEnter>
  );
}
