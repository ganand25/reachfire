'use client';
import { PageEnter } from '@/components/Animated';
import { DisclaimerBanner } from '@/components/DisclaimerBanner';
import { NextSteps } from '@/components/NextSteps';

import { useMemo, useCallback } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CurrencyInput } from '@/components/CurrencyInput';
import { SliderInput } from '@/components/SliderInput';
import { StatCard } from '@/components/StatCard';
import { ExportBar } from '@/components/ExportBar';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { downloadCSV } from '@/lib/csv';
import { lifetimeHealthcareCost } from '@/lib/calculations/healthcare';
import { medicalTourismData } from '@/lib/data/medicalTourism';

interface HealthcareInputs {
  retirementAge: number;
  currentAge: number;
  annualIncome: number;
  familySize: number;
}

const DEFAULT_INPUTS: HealthcareInputs = {
  retirementAge: 45,
  currentAge: 35,
  annualIncome: 50000,
  familySize: 1,
};

export function HealthcareClient(): React.JSX.Element {
  const [inputs, setInputs, clearInputs] = useLocalStorage<HealthcareInputs>(
    'reachfire:healthcare',
    DEFAULT_INPUTS
  );
  const { retirementAge, currentAge, annualIncome, familySize } = inputs;
  const setRetirementAge = (v: number): void =>
    setInputs((prev) => ({ ...prev, retirementAge: v }));
  const setCurrentAge = (v: number): void => setInputs((prev) => ({ ...prev, currentAge: v }));
  const setAnnualIncome = (v: number): void => setInputs((prev) => ({ ...prev, annualIncome: v }));
  const setFamilySize = (v: number): void => setInputs((prev) => ({ ...prev, familySize: v }));

  const projection = useMemo(
    () =>
      lifetimeHealthcareCost(
        currentAge,
        retirementAge,
        90,
        annualIncome,
        familySize,
        0.055,
        'national'
      ),
    [currentAge, retirementAge, annualIncome, familySize]
  );

  function formatMoney(v: number): string {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
    if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
    return `$${v.toFixed(0)}`;
  }

  const chartData = projection.yearlyProjections.map((y) => ({
    age: y.age,
    premium: Math.round(y.annualPremium),
    oop: Math.round(y.estimatedOutOfPocket),
    total: Math.round(y.totalAnnualCost),
    type: y.isMedicare ? 'Medicare' : 'ACA',
  }));

  const handleExportCSV = useCallback(() => {
    const headers = ['Age', 'Premium', 'Out-of-Pocket', 'Total', 'Type'];
    const rows = chartData.map((d) => [d.age, d.premium, d.oop, d.total, d.type]);
    downloadCSV('reachfire-healthcare', headers, rows);
  }, [chartData]);

  return (
    <PageEnter>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
            Healthcare Cost Estimator
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            The #1 fear for early retirees — modeled in detail. ACA premiums, Medicare costs, HSA
            strategy, and medical tourism savings.
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
              <h2 className="font-semibold text-sm">Your Profile</h2>
              <SliderInput
                label="Current Age"
                value={currentAge}
                min={25}
                max={64}
                onChange={setCurrentAge}
              />
              <SliderInput
                label="Retirement Age"
                value={retirementAge}
                min={currentAge + 1}
                max={64}
                onChange={setRetirementAge}
              />
              <CurrencyInput
                label="Expected Annual Income in Retirement"
                value={annualIncome}
                onChange={setAnnualIncome}
                hint="Used for ACA subsidy calculation"
              />
              <SliderInput
                label="Family Size"
                value={familySize}
                min={1}
                max={6}
                onChange={setFamilySize}
                format="number"
              />
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-2 space-y-5">
            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <StatCard
                label="Lifetime Total"
                value={projection.totalCost}
                format="currency"
                glow
                subtitle="Age 45 to 90"
              />
              <StatCard
                label="Pre-Medicare"
                value={projection.preMedicareCost}
                format="currency"
                subtitle={`Ages ${retirementAge}–64`}
              />
              <StatCard
                label="Medicare Phase"
                value={projection.medicareCost}
                format="currency"
                subtitle="Ages 65–90"
              />
            </div>

            {/* Chart */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="font-semibold text-sm mb-1">Annual Healthcare Cost Over Time</h2>
              <p className="text-xs text-muted-foreground mb-4">
                The Medicare cliff at 65 typically reduces premiums but increases out-of-pocket
                costs
              </p>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="premGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.70 0.24 50)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="oklch(0.70 0.24 50)" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="oopGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.82 0.18 75)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(0.82 0.18 75)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="age"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    label={{ value: 'Age', position: 'insideBottom', offset: -2, fontSize: 11 }}
                  />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} tickFormatter={formatMoney} />
                  <Tooltip
                    formatter={(v: number | undefined) => (v !== undefined ? formatMoney(v) : '')}
                    contentStyle={{
                      background: 'var(--popover)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="premium"
                    stackId="a"
                    stroke="oklch(0.70 0.24 50)"
                    fill="url(#premGrad)"
                    name="Premium"
                    strokeWidth={1.5}
                  />
                  <Area
                    type="monotone"
                    dataKey="oop"
                    stackId="a"
                    stroke="oklch(0.82 0.18 75)"
                    fill="url(#oopGrad)"
                    name="Out-of-Pocket"
                    strokeWidth={1.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Medical Tourism */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="font-semibold text-sm mb-1">Medical Tourism Savings</h2>
              <p className="text-xs text-muted-foreground mb-4">
                JCI-accredited hospitals abroad can cut costs by 60–90% on major procedures
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-muted-foreground">Procedure</th>
                      <th className="text-right py-2 text-muted-foreground">USA</th>
                      <th className="text-right py-2 text-muted-foreground">India</th>
                      <th className="text-right py-2 text-muted-foreground">Thailand</th>
                      <th className="text-right py-2 text-muted-foreground">Mexico</th>
                      <th className="text-right py-2 text-muted-foreground">Savings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicalTourismData.slice(0, 6).map((p) => {
                      const usCost = p.costs['USA'] ?? 0;
                      const india = p.costs['India'];
                      const thailand = p.costs['Thailand'];
                      const mexico = p.costs['Mexico'];
                      const bestAbroad = Math.min(
                        ...Object.entries(p.costs)
                          .filter(([k]) => k !== 'USA')
                          .map(([, v]) => v)
                      );
                      const savings = usCost - bestAbroad - 2500;

                      return (
                        <tr key={p.procedure} className="border-b border-border/30">
                          <td className="py-2 font-medium">{p.procedure}</td>
                          <td className="py-2 text-right tabular-nums">{formatMoney(usCost)}</td>
                          <td className="py-2 text-right tabular-nums text-emerald-400">
                            {india ? formatMoney(india) : '—'}
                          </td>
                          <td className="py-2 text-right tabular-nums text-emerald-400">
                            {thailand ? formatMoney(thailand) : '—'}
                          </td>
                          <td className="py-2 text-right tabular-nums text-emerald-400">
                            {mexico ? formatMoney(mexico) : '—'}
                          </td>
                          <td className="py-2 text-right tabular-nums font-bold text-emerald-400">
                            {savings > 0 ? `~${formatMoney(savings)}` : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                * Savings include estimated $2,500 travel cost. Prices are averages at
                JCI-accredited facilities.
              </p>
            </div>
          </div>
        </div>
        <NextSteps currentPath="/healthcare" />
        <DisclaimerBanner context="healthcare" />
      </div>
    </PageEnter>
  );
}
