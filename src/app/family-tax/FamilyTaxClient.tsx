'use client';

import { useState, useMemo } from 'react';
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
} from 'recharts';
import Link from 'next/link';
import { PageEnter } from '@/components/Animated';
import { DisclaimerBanner } from '@/components/DisclaimerBanner';
import { NextSteps } from '@/components/NextSteps';
import { CurrencyInput } from '@/components/CurrencyInput';
import { SliderInput } from '@/components/SliderInput';
import { StatCard } from '@/components/StatCard';
import { ExportBar } from '@/components/ExportBar';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { downloadCSV } from '@/lib/csv';
import { cn } from '@/lib/utils';
import type { FamilyTaxInputs } from '@/types/family-tax';
import { runFamilyTaxStrategies } from '@/services/family-tax-optimizer';
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
} from 'lucide-react';

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
  filingStatus: 'married',
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
    'reachfire:family-tax',
    DEFAULT_INPUTS
  );
  const [selectedStrategy, setSelectedStrategy] = useState('tax-optimized');
  const [showTable, setShowTable] = useState(false);

  function update<K extends keyof FamilyTaxInputs>(key: K, value: FamilyTaxInputs[K]): void {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  const strategies = useMemo(() => runFamilyTaxStrategies(inputs), [inputs]);
  const selected = strategies.find((s) => s.id === selectedStrategy) ?? strategies[0];
  const best = strategies.reduce((a, b) => (a.totalFamilyTax < b.totalFamilyTax ? a : b));
  const worst = strategies.reduce((a, b) => (a.totalFamilyTax > b.totalFamilyTax ? a : b));
  const maxSavings = worst.totalFamilyTax - best.totalFamilyTax;
  const savingsVsBest = selected.totalFamilyTax - best.totalFamilyTax;

  // Ranked horizontal stacked bars: Your Tax + Heir Tax only (ACA shown separately as bonus).
  const barChartData = strategies
    .map((s) => ({
      id: s.id,
      name: s.name.length > 22 ? s.name.slice(0, 22) + '…' : s.name,
      fullName: s.name,
      'Your Tax': Math.round(s.parentLifetimeTax),
      'Heir Tax': Math.round(s.heirTaxAtDeath),
      total: Math.round(s.totalFamilyTax),
      isBest: s.id === best.id,
      isWorst: s.id === worst.id,
    }))
    .sort((a, b) => a.total - b.total);

  function handleExportCSV(): void {
    const headers = [
      'Age',
      'Trad W/D',
      'Roth W/D',
      'Taxable W/D',
      'Cash W/D',
      'Roth Conversion',
      'SS Income',
      'MAGI',
      'Federal Tax',
      'LTCG Tax',
      'IRMAA',
      'Parent Tax',
      'ACA Subsidy',
      'Trad Bal',
      'Roth Bal',
      'Taxable Bal',
      'Cash Bal',
      'Total Bal',
      'Heir Tax If Death',
      'Roth % of Total',
    ];
    const rows = selected.years.map((y) => [
      y.age,
      Math.round(y.traditionalWithdrawal),
      Math.round(y.rothWithdrawal),
      Math.round(y.taxableWithdrawal),
      Math.round(y.cashWithdrawal),
      Math.round(y.rothConversion),
      Math.round(y.socialSecurityIncome),
      Math.round(y.magi),
      Math.round(y.federalTax),
      Math.round(y.ltcgTax),
      Math.round(y.irmaaSurcharge),
      Math.round(y.parentTax),
      Math.round(y.acaSubsidy),
      Math.round(y.traditionalBalance),
      Math.round(y.rothBalance),
      Math.round(y.taxableBalance),
      Math.round(y.cashBalance),
      Math.round(y.totalBalance),
      Math.round(y.heirTaxIfDeathThisYear),
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
              Lifetime Family Tax
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              <strong className="text-foreground">Your tax + Heir tax</strong>, across every
              strategy. If you skip Roth conversions, your Traditional IRA keeps growing — and your
              heirs inherit the tax bill.
            </p>
          </div>
          <ExportBar
            onExportCSV={handleExportCSV}
            onReset={clearInputs}
            className="no-print shrink-0"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ── Inputs ── */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <h2 className="font-semibold text-sm flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" />
                Personal Details
              </h2>
              <SliderInput
                label="Current Age"
                value={inputs.currentAge}
                min={25}
                max={70}
                onChange={(v) => update('currentAge', v)}
                format="years"
              />
              <SliderInput
                label="Retirement Age"
                value={inputs.retirementAge}
                min={Math.max(inputs.currentAge + 1, 30)}
                max={75}
                onChange={(v) => update('retirementAge', v)}
                format="years"
              />
              <SliderInput
                label="Death Age"
                value={inputs.deathAge}
                min={inputs.retirementAge + 5}
                max={100}
                onChange={(v) => update('deathAge', v)}
                format="years"
              />
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Filing Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['single', 'married'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => update('filingStatus', s)}
                      className={cn(
                        'px-3 py-2 rounded-lg border text-sm font-medium transition-all',
                        inputs.filingStatus === s
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:border-foreground/30'
                      )}
                    >
                      {s === 'single' ? 'Single' : 'Married'}
                    </button>
                  ))}
                </div>
              </div>
              <SliderInput
                label="Household Size"
                value={inputs.householdSize}
                min={1}
                max={6}
                onChange={(v) => update('householdSize', v)}
                format="number"
                hint="For ACA subsidy calculation (FPL)"
              />
            </div>

            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <h2 className="font-semibold text-sm flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                Account Balances
              </h2>
              <CurrencyInput
                label="Traditional 401k/IRA"
                value={inputs.traditionalBalance}
                onChange={(v) => update('traditionalBalance', v)}
                hint="Pre-tax — heirs pay tax on this"
              />
              <CurrencyInput
                label="Roth IRA/401k"
                value={inputs.rothBalance}
                onChange={(v) => update('rothBalance', v)}
                hint="Tax-free to you AND your heirs"
              />
              <CurrencyInput
                label="Taxable Brokerage"
                value={inputs.taxableBalance}
                onChange={(v) => update('taxableBalance', v)}
                hint="Step-up in basis at death"
              />
              <CurrencyInput
                label="Cash / Savings"
                value={inputs.cashBalance}
                onChange={(v) => update('cashBalance', v)}
              />
              <SliderInput
                label="Cost Basis %"
                value={inputs.taxableCostBasisPercent}
                min={10}
                max={100}
                onChange={(v) => update('taxableCostBasisPercent', v)}
                format="number"
              />
              <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-3 py-2.5 mt-1">
                <span className="text-xs font-medium text-muted-foreground">
                  Total today
                </span>
                <span className="font-bold tabular-nums text-base text-primary">
                  {formatMoney(
                    inputs.traditionalBalance +
                      inputs.rothBalance +
                      inputs.taxableBalance +
                      inputs.cashBalance
                  )}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <h2 className="font-semibold text-sm">Annual Contributions</h2>
              <CurrencyInput
                label="Traditional 401k/IRA"
                value={inputs.annualTraditionalContribution}
                onChange={(v) => update('annualTraditionalContribution', v)}
              />
              <CurrencyInput
                label="Roth IRA/401k"
                value={inputs.annualRothContribution}
                onChange={(v) => update('annualRothContribution', v)}
              />
              <CurrencyInput
                label="Taxable Brokerage"
                value={inputs.annualTaxableContribution}
                onChange={(v) => update('annualTaxableContribution', v)}
              />
            </div>

            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <h2 className="font-semibold text-sm">Assumptions</h2>
              <CurrencyInput
                label="Annual Expenses (today's $)"
                value={inputs.annualExpenses}
                onChange={(v) => update('annualExpenses', v)}
              />
              <SliderInput
                label="Growth Rate"
                value={inputs.growthRate}
                min={0.03}
                max={0.12}
                step={0.005}
                onChange={(v) => update('growthRate', v)}
                format="percent"
              />
              <SliderInput
                label="Inflation Rate"
                value={inputs.inflationRate}
                min={0.01}
                max={0.06}
                step={0.005}
                onChange={(v) => update('inflationRate', v)}
                format="percent"
              />
              <CurrencyInput
                label="Social Security (monthly)"
                value={inputs.socialSecurityMonthly}
                onChange={(v) => update('socialSecurityMonthly', v)}
              />
              <SliderInput
                label="SS Claiming Age"
                value={inputs.socialSecurityAge}
                min={62}
                max={70}
                onChange={(v) => update('socialSecurityAge', v)}
                format="years"
              />
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
                onChange={(v) => update('heirTaxBracket', v)}
                format="percent"
                hint="Your heir's marginal bracket when they drain the inherited IRA over 10 years"
              />
            </div>
          </div>

          {/* ── Results ── */}
          <div className="lg:col-span-8 space-y-6">
            {/* Hero: explicit Your + Heir = Family math for the selected strategy */}
            <div
              className={cn(
                'rounded-xl border p-5',
                selected.id === best.id
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : 'border-border bg-card'
              )}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                      Selected strategy
                    </p>
                    {selected.id === best.id && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-medium">
                        LOWEST
                      </span>
                    )}
                  </div>
                  <h2 className="font-display text-xl font-bold mb-3">{selected.name}</h2>
                  <div className="space-y-1.5 text-sm font-mono tabular-nums max-w-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Your lifetime tax</span>
                      <span>{formatMoney(selected.parentLifetimeTax)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">+ Heir tax at death</span>
                      <span
                        className={selected.heirTaxAtDeath > 0 ? 'text-amber-400' : undefined}
                      >
                        {formatMoney(selected.heirTaxAtDeath)}
                      </span>
                    </div>
                    <div className="border-t border-border/60 pt-1.5 flex justify-between font-bold text-base">
                      <span>= Family tax</span>
                      <span>{formatMoney(selected.totalFamilyTax)}</span>
                    </div>
                    {selected.totalAcaSubsidies > 0 && (
                      <div className="flex justify-between text-xs text-emerald-400 pt-0.5">
                        <span>+ ACA subsidy bonus</span>
                        <span>{formatMoney(selected.totalAcaSubsidies)}</span>
                      </div>
                    )}
                  </div>
                </div>
                {selected.id !== best.id && maxSavings > 0 && (
                  <div className="shrink-0 sm:text-right space-y-2">
                    <div className="inline-flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
                      <TrendingDown className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                      <div className="text-left">
                        <p className="text-xs text-muted-foreground">
                          Save vs. <strong className="text-foreground">{best.name}</strong>
                        </p>
                        <p className="font-bold text-emerald-400 text-lg leading-tight">
                          {formatMoney(savingsVsBest)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedStrategy(best.id)}
                      className="block w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg gradient-ember text-white font-semibold text-xs shadow-md hover:opacity-90 transition-opacity"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      Switch to best
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard
                label="Family Tax"
                value={selected.totalFamilyTax}
                format="currency"
                size="sm"
                glow={selected.id === best.id}
              />
              <StatCard
                label="Your Tax"
                value={selected.parentLifetimeTax}
                format="currency"
                size="sm"
              />
              <StatCard
                label="Heir Tax"
                value={selected.heirTaxAtDeath}
                format="currency"
                size="sm"
                trend={selected.heirTaxAtDeath > 0 ? 'down' : 'neutral'}
              />
              <StatCard
                label="Heirs Keep"
                value={selected.inheritanceKeptPercent * 100}
                format="decimal"
                decimals={0}
                suffix="%"
                size="sm"
                subtitle={formatMoney(selected.afterTaxInheritance)}
                trend="up"
              />
            </div>

            {/* Ranked lifetime family tax chart */}
            <div>
              <div className="flex items-end justify-between mb-3 gap-2 flex-wrap">
                <div>
                  <h2 className="font-semibold text-sm">Lifetime Family Tax — Ranked</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Each bar = your tax + heir tax. Sorted lowest first.
                  </p>
                </div>
                {maxSavings > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Spread:{' '}
                    <span className="font-bold text-emerald-400">{formatMoney(maxSavings)}</span>{' '}
                    between best and worst
                  </p>
                )}
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <ResponsiveContainer width="100%" height={Math.max(220, barChartData.length * 48)}>
                  <BarChart
                    data={barChartData}
                    layout="vertical"
                    margin={{ left: 10, right: 80, top: 8, bottom: 8 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      tickFormatter={(v: number) => formatMoney(v)}
                      tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={150}
                      tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                    />
                    <Tooltip
                      cursor={{ fill: 'var(--muted)', opacity: 0.3 }}
                      formatter={(v: number | undefined) =>
                        v !== undefined ? formatMoney(v) : ''
                      }
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar
                      dataKey="Your Tax"
                      stackId="a"
                      fill="oklch(0.62 0.18 35)"
                      onClick={(d: { id?: string }) => d?.id && setSelectedStrategy(d.id)}
                    >
                      {barChartData.map((entry, i) => (
                        <Cell
                          key={`your-${i}`}
                          cursor="pointer"
                          fill={
                            entry.isBest
                              ? 'oklch(0.65 0.20 145)'
                              : entry.isWorst
                                ? 'oklch(0.60 0.22 25)'
                                : 'oklch(0.62 0.18 35)'
                          }
                          fillOpacity={entry.id === selected.id ? 1 : 0.75}
                        />
                      ))}
                    </Bar>
                    <Bar
                      dataKey="Heir Tax"
                      stackId="a"
                      fill="oklch(0.72 0.18 75)"
                      onClick={(d: { id?: string }) => d?.id && setSelectedStrategy(d.id)}
                    >
                      {barChartData.map((entry, i) => (
                        <Cell
                          key={`heir-${i}`}
                          cursor="pointer"
                          fill={
                            entry.isBest
                              ? 'oklch(0.78 0.18 145)'
                              : entry.isWorst
                                ? 'oklch(0.70 0.22 50)'
                                : 'oklch(0.72 0.18 75)'
                          }
                          fillOpacity={entry.id === selected.id ? 1 : 0.75}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-[11px] text-muted-foreground mt-2 text-center">
                  Click a bar to select that strategy.
                </p>
              </div>
            </div>

            {/* Inheritance Impact — visceral "what your heirs actually keep" */}
            <div>
              <div className="mb-3">
                <h2 className="font-semibold text-sm">What Your Heirs Actually Keep</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Of the total estate at death, after the IRS takes their cut from the inherited
                  Traditional IRA.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                {[...strategies]
                  .sort((a, b) => b.inheritanceKeptPercent - a.inheritanceKeptPercent)
                  .map((s) => {
                    const pct = s.inheritanceKeptPercent * 100;
                    const isBest = s.id === best.id;
                    return (
                      <div key={s.id}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span
                            className={cn(
                              'font-medium',
                              s.id === selected.id ? 'text-foreground' : 'text-muted-foreground'
                            )}
                          >
                            {s.name}
                          </span>
                          <span className="tabular-nums">
                            <span className="text-emerald-400 font-bold">
                              {formatMoney(s.afterTaxInheritance)}
                            </span>{' '}
                            <span className="text-muted-foreground">
                              ({pct.toFixed(0)}% kept)
                            </span>
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden relative">
                          <div
                            className={cn(
                              'h-full transition-all',
                              isBest ? 'bg-emerald-400' : 'bg-primary/70'
                            )}
                            style={{ width: `${Math.min(100, pct)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
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
                        'relative text-left rounded-xl border p-4 transition-all',
                        selectedStrategy === s.id
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                          : 'border-border bg-card hover:border-foreground/20'
                      )}
                    >
                      {isBest && (
                        <span className="absolute top-3 right-3 text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-medium">
                          LOWEST
                        </span>
                      )}
                      <h3 className="font-semibold text-sm mb-1">{s.name}</h3>
                      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                        {s.description}
                      </p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Your tax</span>
                          <span className="tabular-nums">{formatMoney(s.parentLifetimeTax)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">+ Heir tax</span>
                          <span
                            className={cn(
                              'tabular-nums',
                              s.heirTaxAtDeath > 0 && 'text-amber-400'
                            )}
                          >
                            {formatMoney(s.heirTaxAtDeath)}
                          </span>
                        </div>
                        <div className="flex justify-between border-t border-border/50 pt-1 mt-1">
                          <span className="font-semibold">= Family tax</span>
                          <span className="font-bold tabular-nums">
                            {formatMoney(s.totalFamilyTax)}
                          </span>
                        </div>
                        <div className="flex justify-between pt-1">
                          <span className="text-muted-foreground">Heirs keep</span>
                          <span className="tabular-nums text-emerald-400 font-medium">
                            {formatMoney(s.afterTaxInheritance)}
                            <span className="text-muted-foreground ml-1">
                              ({Math.round(s.inheritanceKeptPercent * 100)}%)
                            </span>
                          </span>
                        </div>
                        {s.totalAcaSubsidies > 0 && (
                          <div className="flex justify-between text-[11px] text-muted-foreground">
                            <span>ACA bonus</span>
                            <span className="tabular-nums text-emerald-400">
                              +{formatMoney(s.totalAcaSubsidies)}
                            </span>
                          </div>
                        )}
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
                {showTable ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {showTable && (
                <div className="mt-3 rounded-xl border border-border bg-card overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="px-2 py-2 text-left font-medium text-muted-foreground">
                          Age
                        </th>
                        <th className="px-2 py-2 text-right font-medium text-muted-foreground">
                          Conversion
                        </th>
                        <th className="px-2 py-2 text-right font-medium text-muted-foreground">
                          MAGI
                        </th>
                        <th className="px-2 py-2 text-right font-medium text-muted-foreground">
                          Parent Tax
                        </th>
                        <th className="px-2 py-2 text-right font-medium text-muted-foreground">
                          ACA
                        </th>
                        <th className="px-2 py-2 text-right font-medium text-muted-foreground">
                          Trad Bal
                        </th>
                        <th className="px-2 py-2 text-right font-medium text-muted-foreground">
                          Roth Bal
                        </th>
                        <th className="px-2 py-2 text-right font-medium text-muted-foreground">
                          Heir Tax
                        </th>
                        <th className="px-2 py-2 text-right font-medium text-muted-foreground">
                          Roth %
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selected.years.map((y) => (
                        <tr
                          key={y.age}
                          className={cn(
                            'border-b border-border/50 hover:bg-muted/20 transition-colors',
                            y.age >= 73 && y.traditionalBalance > 0 && 'bg-amber-500/5'
                          )}
                        >
                          <td className="px-2 py-1.5 font-medium">
                            {y.age}
                            {y.age >= 73 && y.traditionalBalance > 0 && (
                              <span className="ml-1 text-[10px] text-amber-400">RMD</span>
                            )}
                            {y.age === 65 && (
                              <span className="ml-1 text-[10px] text-blue-400">MCR</span>
                            )}
                          </td>
                          <td className="px-2 py-1.5 text-right tabular-nums text-primary">
                            {y.rothConversion > 0 ? formatMoney(y.rothConversion) : '—'}
                          </td>
                          <td className="px-2 py-1.5 text-right tabular-nums">
                            {formatMoney(y.magi)}
                          </td>
                          <td className="px-2 py-1.5 text-right tabular-nums text-destructive">
                            {formatMoney(y.parentTax)}
                          </td>
                          <td className="px-2 py-1.5 text-right tabular-nums text-emerald-400">
                            {y.acaSubsidy > 0 ? formatMoney(y.acaSubsidy) : '—'}
                          </td>
                          <td className="px-2 py-1.5 text-right tabular-nums">
                            {formatMoney(y.traditionalBalance)}
                          </td>
                          <td className="px-2 py-1.5 text-right tabular-nums">
                            {formatMoney(y.rothBalance)}
                          </td>
                          <td className="px-2 py-1.5 text-right tabular-nums text-amber-400">
                            {formatMoney(y.heirTaxIfDeathThisYear)}
                          </td>
                          <td className="px-2 py-1.5 text-right tabular-nums">
                            {formatPercent(y.rothPercentOfTotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* The RMD trap — directly explains the scenario the user worried about */}
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 space-y-3">
              <h2 className="font-semibold text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                The RMD Trap: Why &ldquo;Do Nothing&rdquo; Is Often The Worst
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                If you skip Roth conversions, your Traditional IRA keeps compounding tax-deferred
                until age 73 — when the IRS forces Required Minimum Distributions. By death, the
                balance can be enormous, and the{' '}
                <strong className="text-foreground">SECURE Act</strong> requires non-spouse heirs to
                drain it within 10 years at their marginal rate (often 24–32% during peak earning
                years). At a {Math.round(inputs.heirTaxBracket * 100)}% heir bracket, the &ldquo;Do
                Nothing&rdquo; strategy here would cost your family{' '}
                <strong className="text-amber-400">
                  {formatMoney(
                    (strategies.find((s) => s.id === 'do-nothing')?.heirTaxAtDeath ?? 0)
                  )}
                </strong>{' '}
                in heir tax alone.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="rounded-lg bg-card border border-border p-3">
                  <p className="font-semibold text-foreground mb-1">Your Tax</p>
                  <p className="text-muted-foreground">
                    Income tax on withdrawals, Roth conversions, RMDs, SS taxation, plus IRMAA
                    surcharges after 65.
                  </p>
                </div>
                <div className="rounded-lg bg-card border border-border p-3">
                  <p className="font-semibold text-foreground mb-1">Heir Tax</p>
                  <p className="text-muted-foreground">
                    Heir&apos;s marginal rate × Traditional IRA balance at your death. Roth and
                    taxable brokerage pass tax-free (step-up basis).
                  </p>
                </div>
                <div className="rounded-lg bg-card border border-border p-3">
                  <p className="font-semibold text-foreground mb-1">ACA Bonus (separate)</p>
                  <p className="text-muted-foreground">
                    Pre-Medicare, low MAGI qualifies for premium subsidies. Shown separately so it
                    doesn&apos;t hide the heir cost.
                  </p>
                </div>
              </div>
            </div>

            {/* How it works */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <h2 className="font-semibold text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Family Tax = Your Tax + Heir Tax
              </h2>
              <div className="text-xs text-muted-foreground space-y-2">
                <p>
                  <strong className="text-foreground">Roth conversions trade your tax for theirs:</strong>{' '}
                  You pay more now (filling your 12/22/24% bracket), but your heirs receive tax-free
                  Roth dollars instead of fully taxable Traditional IRA. The math wins when your
                  bracket is at or below your heir&apos;s expected bracket.
                </p>
                <p>
                  <strong className="text-foreground">Step-up in basis:</strong> Taxable brokerage
                  gets a reset cost basis at death — all unrealized gains evaporate. That&apos;s why
                  it counts as &ldquo;heir-friendly&rdquo; here.
                </p>
                <p>
                  <strong className="text-foreground">ACA subsidies</strong> are tracked separately
                  as a bonus, not subtracted from the family tax total — otherwise a strategy with
                  big subsidies can mask a big heir bill.
                </p>
              </div>
            </div>

            {/* Cross-link */}
            <div className="rounded-xl border border-border bg-card p-5 flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">Looking at just your tax?</p>
                <p className="text-xs text-muted-foreground">
                  The Retirement Tax Optimizer focuses on minimizing your personal lifetime taxes.
                </p>
              </div>
              <Link
                href="/retirement"
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium gradient-ember text-white hover:opacity-90 transition-opacity"
              >
                Tax Optimizer
              </Link>
            </div>

            <NextSteps currentPath="/family-tax" />
            <DisclaimerBanner />
          </div>
        </div>
      </div>
    </PageEnter>
  );
}
