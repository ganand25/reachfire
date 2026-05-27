"use client";

import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import Link from "next/link";
import { PageEnter } from "@/components/Animated";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { CurrencyInput } from "@/components/CurrencyInput";
import { SliderInput } from "@/components/SliderInput";
import { StatCard } from "@/components/StatCard";
import { ExportBar } from "@/components/ExportBar";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { downloadCSV } from "@/lib/csv";
import { cn } from "@/lib/utils";
import type { FamilyTaxInputs } from "@/types/family-tax";
import { runFamilyTaxStrategies } from "@/services/family-tax-optimizer";
import {
  Shield,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Info,
  DollarSign,
  Users,
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

const DEFAULT_INPUTS: FamilyTaxInputs = {
  currentAge: 50,
  retirementAge: 60,
  lifeExpectancy: 85,
  deathAge: 85,
  filingStatus: "married",
  householdSize: 2,
  traditionalBalance: 800000,
  rothBalance: 200000,
  taxableBalance: 300000,
  cashBalance: 50000,
  taxableCostBasisPercent: 60,
  annualTraditionalContribution: 23500,
  annualRothContribution: 7000,
  annualTaxableContribution: 12000,
  contributionOverrides: {},
  annualExpenses: 60000,
  growthRate: 0.07,
  inflationRate: 0.03,
  socialSecurityMonthly: 2000,
  socialSecurityAge: 67,
  heirTaxBracket: 0.28,
};

export function FamilyTaxClient(): React.JSX.Element {
  const [inputs, setInputs, clearInputs] = useLocalStorage<FamilyTaxInputs>(
    "reachfire:family-tax",
    DEFAULT_INPUTS
  );
  const [selectedStrategy, setSelectedStrategy] = useState("tax-optimized");
  const [showTable, setShowTable] = useState(false);

  function update<K extends keyof FamilyTaxInputs>(key: K, value: FamilyTaxInputs[K]): void {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  const strategies = useMemo(() => runFamilyTaxStrategies(inputs), [inputs]);
  const selected = strategies.find((s) => s.id === selectedStrategy) ?? strategies[0];
  const best = strategies.reduce((a, b) => (a.totalFamilyTax < b.totalFamilyTax ? a : b));
  const worst = strategies.reduce((a, b) => (a.totalFamilyTax > b.totalFamilyTax ? a : b));
  const maxSavings = worst.totalFamilyTax - best.totalFamilyTax;

  const barChartData = strategies
    .map((s) => ({
      name: s.name.length > 18 ? s.name.slice(0, 18) + "…" : s.name,
      fullName: s.name,
      "Parent Tax": Math.round(s.parentLifetimeTax),
      "Heir Tax": Math.round(s.heirTaxAtDeath),
      "ACA Subsidies": -Math.round(s.totalAcaSubsidies),
      total: Math.round(s.totalFamilyTax),
      isBest: s.id === best.id,
    }))
    .sort((a, b) => a.total - b.total);

  function handleExportCSV(): void {
    const headers = [
      "Age", "Trad W/D", "Roth W/D", "Taxable W/D", "Cash W/D",
      "Roth Conversion", "SS Income", "MAGI", "Federal Tax", "LTCG Tax",
      "IRMAA", "Parent Tax", "ACA Subsidy",
      "Trad Bal", "Roth Bal", "Taxable Bal", "Cash Bal", "Total Bal",
      "Heir Tax If Death", "Roth % of Total",
    ];
    const rows = selected.years.map((y) => [
      y.age, Math.round(y.traditionalWithdrawal), Math.round(y.rothWithdrawal),
      Math.round(y.taxableWithdrawal), Math.round(y.cashWithdrawal),
      Math.round(y.rothConversion), Math.round(y.socialSecurityIncome),
      Math.round(y.magi), Math.round(y.federalTax), Math.round(y.ltcgTax),
      Math.round(y.irmaaSurcharge), Math.round(y.parentTax), Math.round(y.acaSubsidy),
      Math.round(y.traditionalBalance), Math.round(y.rothBalance),
      Math.round(y.taxableBalance), Math.round(y.cashBalance),
      Math.round(y.totalBalance), Math.round(y.heirTaxIfDeathThisYear),
      `${(y.rothPercentOfTotal * 100).toFixed(1)}%`,
    ]);
    downloadCSV(`reachfire-family-tax-${selected.id}`, headers, rows);
  }

  return (
    <PageEnter>
      <div id="family-tax-report" className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
              Total Family Tax Optimizer
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              The only FIRE calculator that quantifies what your kids will pay.
              Most tools optimize your lifetime tax — we optimize your family&apos;s lifetime tax.
            </p>
          </div>
          <ExportBar onExportCSV={handleExportCSV} onReset={clearInputs} pdfElementId="family-tax-report" pdfFilename="reachfire-family-tax-report" className="no-print shrink-0" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ── Inputs ── */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <h2 className="font-semibold text-sm flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" />
                Personal Details
              </h2>
              <SliderInput label="Current Age" value={inputs.currentAge} min={25} max={70} onChange={(v) => update("currentAge", v)} format="years" />
              <SliderInput label="Retirement Age" value={inputs.retirementAge} min={Math.max(inputs.currentAge + 1, 30)} max={75} onChange={(v) => update("retirementAge", v)} format="years" />
              <SliderInput label="Death Age" value={inputs.deathAge} min={inputs.retirementAge + 5} max={100} onChange={(v) => update("deathAge", v)} format="years" />
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Filing Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["single", "married"] as const).map((s) => (
                    <button key={s} onClick={() => update("filingStatus", s)} className={cn("px-3 py-2 rounded-lg border text-sm font-medium transition-all", inputs.filingStatus === s ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-foreground/30")}>
                      {s === "single" ? "Single" : "Married"}
                    </button>
                  ))}
                </div>
              </div>
              <SliderInput label="Household Size" value={inputs.householdSize} min={1} max={6} onChange={(v) => update("householdSize", v)} format="number" hint="For ACA subsidy calculation (FPL)" />
            </div>

            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <h2 className="font-semibold text-sm flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                Account Balances
              </h2>
              <CurrencyInput label="Traditional 401k/IRA" value={inputs.traditionalBalance} onChange={(v) => update("traditionalBalance", v)} hint="Pre-tax — heirs pay tax on this" />
              <CurrencyInput label="Roth IRA/401k" value={inputs.rothBalance} onChange={(v) => update("rothBalance", v)} hint="Tax-free to you AND your heirs" />
              <CurrencyInput label="Taxable Brokerage" value={inputs.taxableBalance} onChange={(v) => update("taxableBalance", v)} hint="Step-up in basis at death" />
              <CurrencyInput label="Cash / Savings" value={inputs.cashBalance} onChange={(v) => update("cashBalance", v)} />
              <SliderInput label="Cost Basis %" value={inputs.taxableCostBasisPercent} min={10} max={100} onChange={(v) => update("taxableCostBasisPercent", v)} format="number" />
            </div>

            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <h2 className="font-semibold text-sm">Annual Contributions</h2>
              <CurrencyInput label="Traditional 401k/IRA" value={inputs.annualTraditionalContribution} onChange={(v) => update("annualTraditionalContribution", v)} />
              <CurrencyInput label="Roth IRA/401k" value={inputs.annualRothContribution} onChange={(v) => update("annualRothContribution", v)} />
              <CurrencyInput label="Taxable Brokerage" value={inputs.annualTaxableContribution} onChange={(v) => update("annualTaxableContribution", v)} />
            </div>

            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <h2 className="font-semibold text-sm">Assumptions</h2>
              <CurrencyInput label="Annual Expenses (today's $)" value={inputs.annualExpenses} onChange={(v) => update("annualExpenses", v)} />
              <SliderInput label="Growth Rate" value={inputs.growthRate} min={0.03} max={0.12} step={0.005} onChange={(v) => update("growthRate", v)} format="percent" />
              <SliderInput label="Inflation Rate" value={inputs.inflationRate} min={0.01} max={0.06} step={0.005} onChange={(v) => update("inflationRate", v)} format="percent" />
              <CurrencyInput label="Social Security (monthly)" value={inputs.socialSecurityMonthly} onChange={(v) => update("socialSecurityMonthly", v)} />
              <SliderInput label="SS Claiming Age" value={inputs.socialSecurityAge} min={62} max={70} onChange={(v) => update("socialSecurityAge", v)} format="years" />
            </div>

            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 space-y-4">
              <h2 className="font-semibold text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                Heir Assumptions
              </h2>
              <SliderInput
                label="Heir's Tax Bracket"
                value={inputs.heirTaxBracket}
                min={0.22}
                max={0.37}
                step={0.01}
                onChange={(v) => update("heirTaxBracket", v)}
                format="percent"
                hint="Your heir's marginal bracket when they drain the inherited IRA over 10 years"
              />
            </div>
          </div>

          {/* ── Results ── */}
          <div className="lg:col-span-8 space-y-6">
            {/* Hero savings */}
            {maxSavings > 0 && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-lg">
                      Save up to <span className="text-emerald-400">{formatMoney(maxSavings)}</span> in total family taxes
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      The <strong>{best.name}</strong> strategy costs your family {formatMoney(best.totalFamilyTax)} total
                      vs. {formatMoney(worst.totalFamilyTax)} with {worst.name}.
                      {best.rothPercentToHeirs > 0.5 && ` ${Math.round(best.rothPercentToHeirs * 100)}% of your legacy goes to heirs tax-free via Roth.`}
                    </p>
                    <button
                      onClick={() => setSelectedStrategy(best.id)}
                      className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg gradient-ember text-white font-semibold text-sm shadow-md hover:opacity-90 transition-opacity glow-ember-sm"
                    >
                      <Zap className="w-4 h-4" />
                      Show Best Strategy
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Total Family Tax" value={selected.totalFamilyTax} format="currency" size="sm" glow={selected.id === best.id} />
              <StatCard label="Parent Tax" value={selected.parentLifetimeTax} format="currency" size="sm" />
              <StatCard label="Heir Tax" value={selected.heirTaxAtDeath} format="currency" size="sm" />
              <StatCard label="ACA Subsidies" value={selected.totalAcaSubsidies} format="currency" size="sm" trend={selected.totalAcaSubsidies > 0 ? "up" : "neutral"} />
            </div>

            {/* Stacked bar chart */}
            <div>
              <h2 className="font-semibold text-sm mb-3">Family Tax Comparison</h2>
              <div className="rounded-xl border border-border bg-card p-4">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={barChartData} layout="vertical" margin={{ left: 10, right: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                    <XAxis type="number" tickFormatter={(v: number) => formatMoney(Math.abs(v))} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                    <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                    <Tooltip
                      formatter={(v: number | undefined) => v !== undefined ? formatMoney(Math.abs(v)) : ""}
                      contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                    <Bar dataKey="Parent Tax" stackId="a" fill="oklch(0.65 0.20 15 / 0.7)">
                      {barChartData.map((entry, i) => (
                        <Cell key={i} fill={entry.isBest ? "oklch(0.72 0.20 145 / 0.7)" : "oklch(0.65 0.20 15 / 0.7)"} />
                      ))}
                    </Bar>
                    <Bar dataKey="Heir Tax" stackId="a" fill="oklch(0.68 0.18 260 / 0.7)" />
                    <Bar dataKey="ACA Subsidies" stackId="a" fill="oklch(0.72 0.20 145 / 0.5)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Strategy cards */}
            <div>
              <h2 className="font-semibold text-sm mb-3">Compare Strategies</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {strategies.map((s) => {
                  const isBest = s.id === best.id;
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
                          LOWEST
                        </span>
                      )}
                      <h3 className="font-semibold text-sm mb-1">{s.name}</h3>
                      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{s.description}</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Parent tax</span>
                          <span className="tabular-nums">{formatMoney(s.parentLifetimeTax)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Heir tax</span>
                          <span className="tabular-nums">{formatMoney(s.heirTaxAtDeath)}</span>
                        </div>
                        {s.totalAcaSubsidies > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">ACA subsidies</span>
                            <span className="tabular-nums text-emerald-400">-{formatMoney(s.totalAcaSubsidies)}</span>
                          </div>
                        )}
                        <div className="flex justify-between border-t border-border/50 pt-1 mt-1">
                          <span className="font-semibold">Family total</span>
                          <span className="font-bold tabular-nums">{formatMoney(s.totalFamilyTax)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Roth to heirs</span>
                          <span className="tabular-nums text-primary">{formatPercent(s.rothPercentToHeirs)}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Year-by-year table */}
            <div>
              <button
                onClick={() => setShowTable(!showTable)}
                className="flex items-center gap-2 text-sm font-semibold hover:text-primary transition-colors"
              >
                Year-by-Year Breakdown ({selected.name})
                {showTable ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showTable && (
                <div className="mt-3 rounded-xl border border-border bg-card overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="px-2 py-2 text-left font-medium text-muted-foreground">Age</th>
                        <th className="px-2 py-2 text-right font-medium text-muted-foreground">Conversion</th>
                        <th className="px-2 py-2 text-right font-medium text-muted-foreground">MAGI</th>
                        <th className="px-2 py-2 text-right font-medium text-muted-foreground">Parent Tax</th>
                        <th className="px-2 py-2 text-right font-medium text-muted-foreground">ACA</th>
                        <th className="px-2 py-2 text-right font-medium text-muted-foreground">Trad Bal</th>
                        <th className="px-2 py-2 text-right font-medium text-muted-foreground">Roth Bal</th>
                        <th className="px-2 py-2 text-right font-medium text-muted-foreground">Heir Tax</th>
                        <th className="px-2 py-2 text-right font-medium text-muted-foreground">Roth %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selected.years.map((y) => (
                        <tr key={y.age} className={cn("border-b border-border/50 hover:bg-muted/20 transition-colors", y.age >= 73 && y.traditionalBalance > 0 && "bg-amber-500/5")}>
                          <td className="px-2 py-1.5 font-medium">
                            {y.age}
                            {y.age >= 73 && y.traditionalBalance > 0 && <span className="ml-1 text-[10px] text-amber-400">RMD</span>}
                            {y.age === 65 && <span className="ml-1 text-[10px] text-blue-400">MCR</span>}
                          </td>
                          <td className="px-2 py-1.5 text-right tabular-nums text-primary">{y.rothConversion > 0 ? formatMoney(y.rothConversion) : "—"}</td>
                          <td className="px-2 py-1.5 text-right tabular-nums">{formatMoney(y.magi)}</td>
                          <td className="px-2 py-1.5 text-right tabular-nums text-destructive">{formatMoney(y.parentTax)}</td>
                          <td className="px-2 py-1.5 text-right tabular-nums text-emerald-400">{y.acaSubsidy > 0 ? formatMoney(y.acaSubsidy) : "—"}</td>
                          <td className="px-2 py-1.5 text-right tabular-nums">{formatMoney(y.traditionalBalance)}</td>
                          <td className="px-2 py-1.5 text-right tabular-nums">{formatMoney(y.rothBalance)}</td>
                          <td className="px-2 py-1.5 text-right tabular-nums text-amber-400">{formatMoney(y.heirTaxIfDeathThisYear)}</td>
                          <td className="px-2 py-1.5 text-right tabular-nums">{formatPercent(y.rothPercentOfTotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Educational callout */}
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 space-y-3">
              <h2 className="font-semibold text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Why Most Calculators Miss This
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                They stop at your death. The SECURE Act forces non-spouse heirs to drain inherited IRAs
                within 10 years, typically during peak earning years at 28–32% brackets. A &ldquo;tax-free&rdquo;
                legacy often isn&apos;t.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="rounded-lg bg-card border border-border p-3">
                  <p className="font-semibold text-foreground mb-1">Parent Tax</p>
                  <p className="text-muted-foreground">Income tax on withdrawals, Roth conversions, RMDs, SS taxation, plus IRMAA surcharges after 65.</p>
                </div>
                <div className="rounded-lg bg-card border border-border p-3">
                  <p className="font-semibold text-foreground mb-1">Heir Tax</p>
                  <p className="text-muted-foreground">Your heirs pay their marginal rate on inherited Traditional IRA — drained over 10 years per SECURE Act.</p>
                </div>
                <div className="rounded-lg bg-card border border-border p-3">
                  <p className="font-semibold text-foreground mb-1">ACA Subsidies</p>
                  <p className="text-muted-foreground">Pre-Medicare, low MAGI qualifies for premium subsidies. Aggressive conversions can wipe these out.</p>
                </div>
              </div>
            </div>

            {/* How it works */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <h2 className="font-semibold text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Total Family Tax = Parent Tax + Heir Tax − ACA Subsidies
              </h2>
              <div className="text-xs text-muted-foreground space-y-2">
                <p>
                  <strong className="text-foreground">Roth conversions are a tradeoff:</strong> You pay more
                  parent tax now, but your heirs receive tax-free Roth money instead of taxable Traditional IRA.
                  The &ldquo;right&rdquo; amount depends on your bracket vs. your heir&apos;s bracket.
                </p>
                <p>
                  <strong className="text-foreground">ACA subsidy cliff:</strong> Before Medicare at 65,
                  keeping MAGI under 400% FPL preserves ACA premium subsidies worth $5K–$20K/yr.
                  Aggressive Roth conversions can blow past this limit.
                </p>
                <p>
                  <strong className="text-foreground">Step-up in basis:</strong> Taxable brokerage accounts
                  get a stepped-up cost basis at death, wiping out all unrealized gains. This makes
                  taxable accounts more heir-friendly than Traditional IRAs.
                </p>
              </div>
            </div>

            {/* Cross-link */}
            <div className="rounded-xl border border-border bg-card p-5 flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">Looking at just your tax?</p>
                <p className="text-xs text-muted-foreground">The Retirement Tax Optimizer focuses on minimizing your personal lifetime taxes.</p>
              </div>
              <Link href="/retirement" className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium gradient-ember text-white hover:opacity-90 transition-opacity">
                Tax Optimizer
              </Link>
            </div>

            <DisclaimerBanner />
          </div>
        </div>
      </div>
    </PageEnter>
  );
}
