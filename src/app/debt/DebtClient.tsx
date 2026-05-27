'use client';
import { PageEnter } from '@/components/Animated';
import { DisclaimerBanner } from '@/components/DisclaimerBanner';
import { NextSteps } from '@/components/NextSteps';

import { useMemo, useCallback } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { SliderInput } from '@/components/SliderInput';
import { StatCard } from '@/components/StatCard';
import { ExportBar } from '@/components/ExportBar';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { downloadCSV } from '@/lib/csv';
import {
  avalanchePayoff,
  snowballPayoff,
  debtToInvestmentRedirect,
  totalDebtSummary,
} from '@/lib/calculations/debt';
import type { DebtItem } from '@/types/fire';
import { cn } from '@/lib/utils';

interface DebtInputs {
  debts: DebtItem[];
  strategy: 'avalanche' | 'snowball';
  investmentReturn: number;
  investmentYears: number;
}

const DEFAULT_INPUTS: DebtInputs = {
  debts: [
    { id: '1', name: 'Student Loan', balance: 25000, interestRate: 0.065, minimumPayment: 280 },
    { id: '2', name: 'Car Loan', balance: 15000, interestRate: 0.055, minimumPayment: 290 },
    { id: '3', name: 'Credit Card', balance: 5000, interestRate: 0.22, minimumPayment: 150 },
  ],
  strategy: 'avalanche',
  investmentReturn: 0.07,
  investmentYears: 20,
};

export function DebtClient(): React.JSX.Element {
  const [inputs, setInputs, clearInputs] = useLocalStorage<DebtInputs>(
    'reachfire:debt',
    DEFAULT_INPUTS
  );
  const { debts, strategy, investmentReturn, investmentYears } = inputs;
  const setDebts = (fn: DebtItem[] | ((prev: DebtItem[]) => DebtItem[])): void =>
    setInputs((prev) => ({ ...prev, debts: fn instanceof Function ? fn(prev.debts) : fn }));
  const setStrategy = (v: 'avalanche' | 'snowball'): void =>
    setInputs((prev) => ({ ...prev, strategy: v }));
  const setInvestmentReturn = (v: number): void =>
    setInputs((prev) => ({ ...prev, investmentReturn: v }));
  const setInvestmentYears = (v: number): void =>
    setInputs((prev) => ({ ...prev, investmentYears: v }));

  const addDebt = (): void => {
    const newDebt: DebtItem = {
      id: String(Date.now()),
      name: 'New Debt',
      balance: 10000,
      interestRate: 0.05,
      minimumPayment: 200,
    };
    setDebts((prev) => [...prev, newDebt]);
  };

  const removeDebt = (id: string): void => {
    setDebts((prev) => prev.filter((d) => d.id !== id));
  };

  const updateDebt = (id: string, field: keyof DebtItem, value: string | number): void => {
    setDebts((prev) => prev.map((d) => (d.id === id ? { ...d, [field]: value } : d)));
  };

  const avalanche = useMemo(() => (debts.length > 0 ? avalanchePayoff(debts) : null), [debts]);
  const snowball = useMemo(() => (debts.length > 0 ? snowballPayoff(debts) : null), [debts]);
  const selected = strategy === 'avalanche' ? avalanche : snowball;
  const summary = useMemo(() => totalDebtSummary(debts), [debts]);

  const redirectResult = useMemo(
    () =>
      selected
        ? debtToInvestmentRedirect(selected, debts, investmentReturn, investmentYears)
        : null,
    [selected, debts, investmentReturn, investmentYears]
  );

  const chartData = useMemo(() => {
    if (!selected) return [];
    // Sample monthly data to yearly
    const yearly: Array<{ year: number; balance: number }> = [];
    for (let i = 0; i < selected.monthlyData.length; i += 12) {
      const data = selected.monthlyData[i];
      if (data) {
        yearly.push({ year: Math.ceil((i + 1) / 12), balance: Math.round(data.totalBalance) });
      }
    }
    // Add final zero
    if (selected.debtFreeMonth > 0) {
      yearly.push({ year: Math.ceil(selected.debtFreeMonth / 12), balance: 0 });
    }
    return yearly;
  }, [selected]);

  const handleExportCSV = useCallback(() => {
    const headers = ['Year', 'Balance'];
    const rows = chartData.map((d) => [d.year, d.balance]);
    downloadCSV('reachfire-debt', headers, rows);
  }, [chartData]);

  function formatMoney(v: number): string {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
    if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
    return `$${v.toFixed(0)}`;
  }

  return (
    <PageEnter>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
            Debt Payoff Accelerator
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Destroy debt strategically, then redirect every freed-up dollar into investments. See
            the explosive effect on your FIRE timeline.
          </p>
          <ExportBar
            onExportCSV={handleExportCSV}
            onReset={clearInputs}
            className="no-print mt-3"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Debt inputs */}
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-sm">Your Debts</h2>
                <button
                  onClick={addDebt}
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add debt
                </button>
              </div>

              <div className="space-y-4">
                {debts.map((debt) => (
                  <div key={debt.id} className="p-3 rounded-lg bg-secondary/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <input
                        value={debt.name}
                        onChange={(e) => updateDebt(debt.id, 'name', e.target.value)}
                        className="text-sm font-medium bg-transparent outline-none border-b border-border/50 focus:border-primary flex-1 mr-2"
                      />
                      <button
                        onClick={() => removeDebt(debt.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <label className="text-muted-foreground">Balance</label>
                        <input
                          type="number"
                          value={debt.balance}
                          onChange={(e) =>
                            updateDebt(debt.id, 'balance', parseFloat(e.target.value) || 0)
                          }
                          className="w-full bg-transparent border border-border rounded px-1.5 py-1 outline-none focus:border-primary mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-muted-foreground">APR %</label>
                        <input
                          type="number"
                          step="0.1"
                          value={(debt.interestRate * 100).toFixed(1)}
                          onChange={(e) =>
                            updateDebt(
                              debt.id,
                              'interestRate',
                              (parseFloat(e.target.value) || 0) / 100
                            )
                          }
                          className="w-full bg-transparent border border-border rounded px-1.5 py-1 outline-none focus:border-primary mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-muted-foreground">Min Pay</label>
                        <input
                          type="number"
                          value={debt.minimumPayment}
                          onChange={(e) =>
                            updateDebt(debt.id, 'minimumPayment', parseFloat(e.target.value) || 0)
                          }
                          className="w-full bg-transparent border border-border rounded px-1.5 py-1 outline-none focus:border-primary mt-1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="mt-4 pt-4 border-t border-border/50 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total debt</span>
                  <span className="font-bold">{formatMoney(summary.totalBalance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg rate</span>
                  <span className="font-bold">
                    {(summary.weightedAverageRate * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Min payments</span>
                  <span className="font-bold">
                    ${summary.totalMinimumPayment.toLocaleString()}/mo
                  </span>
                </div>
              </div>
            </div>

            {/* Strategy */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="font-semibold text-sm mb-3">Strategy</h2>
              <div className="space-y-2">
                {(['avalanche', 'snowball'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStrategy(s)}
                    className={cn(
                      'w-full text-left p-3 rounded-lg text-xs transition-colors',
                      strategy === s
                        ? 'bg-primary/15 border border-primary/30 text-primary'
                        : 'bg-secondary/50 border border-transparent text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <div className="font-medium capitalize">{s}</div>
                    <div className="text-muted-foreground mt-0.5">
                      {s === 'avalanche'
                        ? 'Highest interest first — saves the most money'
                        : 'Lowest balance first — fastest psychological wins'}
                    </div>
                  </button>
                ))}
              </div>

              {avalanche && snowball && (
                <div className="mt-3 pt-3 border-t border-border/50 text-xs">
                  <div className="text-muted-foreground mb-1">Avalanche saves you:</div>
                  <div className="font-bold text-emerald-400">
                    {formatMoney(snowball.totalInterestPaid - avalanche.totalInterestPaid)} in
                    interest
                  </div>
                  <div className="text-muted-foreground mt-1">
                    {snowball.months - avalanche.months} months faster than snowball
                  </div>
                </div>
              )}
            </div>

            {/* Redirect inputs */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <h2 className="font-semibold text-sm">Post-Payoff Investment</h2>
              <SliderInput
                label="Investment Return"
                value={investmentReturn}
                min={0.03}
                max={0.12}
                step={0.005}
                onChange={setInvestmentReturn}
                format="percent"
              />
              <SliderInput
                label="Investment Years"
                value={investmentYears}
                min={5}
                max={40}
                onChange={setInvestmentYears}
                format="years"
              />
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-2 space-y-5">
            {selected ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <StatCard
                    label="Debt-Free In"
                    value={Math.ceil(selected.months / 12)}
                    format="integer"
                    suffix=" yrs"
                    subtitle={`${selected.months} months`}
                    glow
                  />
                  <StatCard
                    label="Interest Paid"
                    value={selected.totalInterestPaid}
                    format="currency"
                    subtitle="Total cost of debt"
                  />
                  {redirectResult && (
                    <StatCard
                      label="Post-Payoff Portfolio"
                      value={redirectResult.projectedValue}
                      format="currency"
                      subtitle={`${investmentYears} yrs of redirected payments`}
                      trend="up"
                    />
                  )}
                </div>

                {/* Payoff chart */}
                <div className="rounded-xl border border-border bg-card p-5">
                  <h2 className="font-semibold text-sm mb-4">Debt Balance Over Time</h2>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="debtGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="oklch(0.52 0.18 250)" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="oklch(0.52 0.18 250)" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis
                        dataKey="year"
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        label={{ value: 'Year', position: 'insideBottom', offset: -2 }}
                      />
                      <YAxis tick={{ fontSize: 10 }} tickLine={false} tickFormatter={formatMoney} />
                      <Tooltip
                        formatter={(v: number | undefined) =>
                          v !== undefined ? formatMoney(v) : ''
                        }
                        contentStyle={{
                          background: 'var(--popover)',
                          border: '1px solid var(--border)',
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="balance"
                        stroke="oklch(0.52 0.18 250)"
                        fill="url(#debtGrad)"
                        strokeWidth={2.5}
                        name="Total Debt"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {redirectResult && (
                  <div className="rounded-xl border border-border bg-card p-5">
                    <h2 className="font-semibold text-sm mb-2">The Redirect Power</h2>
                    <p className="text-xs text-muted-foreground mb-4">
                      Once debt is gone, you redirect $
                      {redirectResult.monthlyRedirectAmount.toFixed(0)}/mo to investments.
                      Here&apos;s what that builds:
                    </p>
                    <div className="text-3xl font-bold gradient-ember-text tabular-nums">
                      {formatMoney(redirectResult.projectedValue)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      invested over {investmentYears} years at {(investmentReturn * 100).toFixed(1)}
                      % return
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <p>Add debts to see your payoff plan</p>
              </div>
            )}
          </div>
        </div>
        <NextSteps currentPath="/debt" />
        <DisclaimerBanner context="debt" />
      </div>
    </PageEnter>
  );
}
