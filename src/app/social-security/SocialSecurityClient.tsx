"use client";
import { PageEnter } from "@/components/Animated";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { NextSteps } from "@/components/NextSteps";

import { useState, useMemo, useCallback } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Legend,
} from "recharts";
import { SliderInput } from "@/components/SliderInput";
import { CurrencyInput } from "@/components/CurrencyInput";
import { StatCard } from "@/components/StatCard";
import { ExportBar } from "@/components/ExportBar";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { downloadCSV } from "@/lib/csv";
import { analyzeSocialSecurity, ssImpactOnFire } from "@/lib/calculations/socialSecurity";
import { cn } from "@/lib/utils";

const CLAIM_AGE_COLORS: Record<number, string> = {
  62: "oklch(0.52 0.18 250)",
  65: "oklch(0.72 0.16 65)",
  67: "oklch(0.70 0.20 50)",
  70: "oklch(0.58 0.22 40)",
};

interface SocialSecurityInputs {
  currentAge: number;
  avgMonthlyEarnings: number;
  annualExpenses: number;
  spouseEarnings: number;
  spouseAge: number;
}

const DEFAULT_INPUTS: SocialSecurityInputs = {
  currentAge: 45,
  avgMonthlyEarnings: 6000,
  annualExpenses: 60000,
  spouseEarnings: 4000,
  spouseAge: 43,
};

export function SocialSecurityClient(): React.JSX.Element {
  const [inputs, setInputs, clearInputs] = useLocalStorage<SocialSecurityInputs>(
    "reachfire:social-security",
    DEFAULT_INPUTS
  );
  const { currentAge, avgMonthlyEarnings, annualExpenses, spouseEarnings, spouseAge } = inputs;
  const setCurrentAge = (v: number): void => setInputs((prev) => ({ ...prev, currentAge: v }));
  const setAvgMonthlyEarnings = (v: number): void => setInputs((prev) => ({ ...prev, avgMonthlyEarnings: v }));
  const setAnnualExpenses = (v: number): void => setInputs((prev) => ({ ...prev, annualExpenses: v }));
  const setSpouseEarnings = (v: number): void => setInputs((prev) => ({ ...prev, spouseEarnings: v }));
  const setSpouseAge = (v: number): void => setInputs((prev) => ({ ...prev, spouseAge: v }));
  const [hasSpouse, setHasSpouse] = useState(false);

  const result = useMemo(
    () =>
      analyzeSocialSecurity({
        currentAge,
        monthlyEarningsHistory: avgMonthlyEarnings,
        fra: 67,
        spouseMonthlyEarnings: hasSpouse ? spouseEarnings : undefined,
        spouseAge: hasSpouse ? spouseAge : undefined,
      }),
    [currentAge, avgMonthlyEarnings, hasSpouse, spouseEarnings, spouseAge]
  );

  const fireImpact = useMemo(
    () => ssImpactOnFire(result.monthlyAtFra, annualExpenses),
    [result.monthlyAtFra, annualExpenses]
  );

  // Build cumulative benefit chart data (age 62–90) for select claiming ages
  const chartData = useMemo(() => {
    const ages = [62, 63, 64, 65, 66, 67, 68, 69, 70];
    const claimAges = [62, 65, 67, 70];
    const points: Array<Record<string, number>> = [];

    for (let age = 62; age <= 90; age++) {
      const point: Record<string, number> = { age };
      for (const claimAge of claimAges) {
        const scenario = result.scenarios.find((s) => s.claimAge === claimAge);
        if (!scenario) continue;
        const yearsCollecting = Math.max(0, age - claimAge);
        point[`age${claimAge}`] = Math.round(scenario.monthlyBenefit * 12 * yearsCollecting);
      }
      points.push(point);
    }
    void ages; // suppress unused
    return points;
  }, [result.scenarios]);

  const handleExportCSV = useCallback(() => {
    const headers = ["Claim Age", "Monthly Benefit", "Annual Benefit", "Lifetime Benefit", "Breakeven Age"];
    const rows = result.scenarios.map((s) => [
      s.claimAge,
      s.monthlyBenefit,
      s.annualBenefit,
      s.lifetimeBenefit,
      s.breakevenAge ?? "N/A",
    ]);
    downloadCSV("reachfire-social-security", headers, rows);
  }, [result.scenarios]);

  function formatMoney(v: number): string {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
    if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
    return `$${v}`;
  }

  const highlight = (age: number): boolean => result.optimalAge === age;

  return (
    <PageEnter>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
          Social Security Optimizer
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Claiming at 62 vs 70 can mean $200K+ difference over your lifetime. Find your optimal
          age and see how SS reduces the portfolio you need to FIRE.
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
              min={30}
              max={64}
              onChange={setCurrentAge}
            />
            <CurrencyInput
              label="Avg Monthly Earnings (career)"
              value={avgMonthlyEarnings}
              onChange={setAvgMonthlyEarnings}
            />
            <CurrencyInput
              label="Annual Expenses in Retirement"
              value={annualExpenses}
              onChange={setAnnualExpenses}
            />
          </div>

          {/* Spouse toggle */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm">Spouse / Partner</h2>
              <button
                onClick={() => setHasSpouse(!hasSpouse)}
                className={cn(
                  "w-10 h-5 rounded-full transition-colors relative",
                  hasSpouse ? "bg-primary" : "bg-muted"
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow",
                    hasSpouse ? "translate-x-5" : "translate-x-0.5"
                  )}
                />
              </button>
            </div>
            {hasSpouse && (
              <div className="space-y-3">
                <SliderInput
                  label="Spouse Age"
                  value={spouseAge}
                  min={30}
                  max={64}
                  onChange={setSpouseAge}
                />
                <CurrencyInput
                  label="Spouse Avg Monthly Earnings"
                  value={spouseEarnings}
                  onChange={setSpouseEarnings}
                />
              </div>
            )}
          </div>

          {/* FIRE impact */}
          <div className="rounded-xl border border-ember bg-card p-5 glow-ember-sm space-y-2">
            <h2 className="font-semibold text-sm gradient-ember-text">SS Impact on FIRE</h2>
            <div className="text-xs text-muted-foreground">At FRA (67) claiming:</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="text-muted-foreground">Annual SS income</div>
                <div className="font-bold">{formatMoney(result.monthlyAtFra * 12)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Portfolio savings</div>
                <div className="font-bold text-emerald-500">{formatMoney(fireImpact.portfolioSavings)}</div>
              </div>
              <div className="col-span-2">
                <div className="text-muted-foreground">Reduced FIRE number</div>
                <div className="font-bold text-lg">{formatMoney(fireImpact.reducedFireNumber)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-5">
          {/* Key metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard
              label="Your PIA"
              value={result.pia}
              format="currency"
              subtitle="At full retirement age"
            />
            <StatCard label="Benefit at 62" value={result.monthlyAt62} format="currency" subtitle="/month" />
            <StatCard label="Benefit at FRA" value={result.monthlyAtFra} format="currency" subtitle="/month" />
            <StatCard
              label="Benefit at 70"
              value={result.monthlyAt70}
              format="currency"
              subtitle="/month"
              glow
            />
          </div>

          {/* Claiming age comparison table */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold text-sm mb-4">Claiming Age Comparison</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-muted-foreground font-medium">Claim Age</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">Monthly</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">Annual</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">Lifetime (to 90)</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">Breakeven vs 62</th>
                  </tr>
                </thead>
                <tbody>
                  {result.scenarios.map((s) => (
                    <tr
                      key={s.claimAge}
                      className={cn(
                        "border-b border-border/30 transition-colors",
                        highlight(s.claimAge)
                          ? "bg-primary/10"
                          : "hover:bg-accent/20"
                      )}
                    >
                      <td className="py-2.5 font-medium">
                        {s.claimAge}
                        {s.claimAge === 67 && (
                          <span className="ml-1.5 text-muted-foreground">(FRA)</span>
                        )}
                        {highlight(s.claimAge) && (
                          <span className="ml-1.5 text-xs text-primary font-semibold">★ optimal</span>
                        )}
                      </td>
                      <td className="py-2.5 text-right tabular-nums font-medium">
                        ${s.monthlyBenefit.toLocaleString()}
                      </td>
                      <td className="py-2.5 text-right tabular-nums">
                        ${s.annualBenefit.toLocaleString()}
                      </td>
                      <td className="py-2.5 text-right tabular-nums">
                        {formatMoney(s.lifetimeBenefit)}
                      </td>
                      <td className="py-2.5 text-right tabular-nums text-muted-foreground">
                        {s.breakevenAge ? `Age ${s.breakevenAge}` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cumulative benefit chart */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold text-sm mb-1">Cumulative Lifetime Benefits</h2>
            <p className="text-xs text-muted-foreground mb-4">
              Where the lines cross = breakeven point. Claiming later wins if you live past your breakeven age.
            </p>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="age"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  label={{ value: "Age", position: "insideBottom", offset: -3, fontSize: 11 }}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  tickFormatter={formatMoney}
                />
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
                <ReferenceLine x={78} stroke="var(--border)" strokeDasharray="4 2" label={{ value: "Avg life expectancy", fontSize: 9, fill: "var(--muted-foreground)" }} />
                {[62, 65, 67, 70].map((age) => (
                  <Line
                    key={age}
                    type="monotone"
                    dataKey={`age${age}`}
                    name={`Claim at ${age}`}
                    stroke={CLAIM_AGE_COLORS[age]}
                    strokeWidth={age === result.optimalAge ? 3 : 1.5}
                    dot={false}
                    strokeDasharray={age === 62 ? "4 2" : undefined}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Spousal benefit */}
          {hasSpouse && result.spouseBenefit !== null && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="font-semibold text-sm mb-3">Household Benefit at 70</h2>
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div className="p-3 rounded-lg bg-secondary">
                  <div className="font-bold">{formatMoney(result.monthlyAt70)}</div>
                  <div className="text-xs text-muted-foreground mt-1">Your benefit/mo</div>
                </div>
                <div className="p-3 rounded-lg bg-secondary">
                  <div className="font-bold">{formatMoney(result.spouseBenefit)}</div>
                  <div className="text-xs text-muted-foreground mt-1">Spouse benefit/mo</div>
                </div>
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <div className="font-bold text-emerald-500">
                    {formatMoney(result.totalHouseholdAt70 ?? 0)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Total household/mo</div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Spouse benefit is the higher of their own earned benefit or 50% of your PIA at your FRA.
              </p>
            </div>
          )}

          {/* Key rules */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold text-sm mb-3">Key Rules to Know</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted-foreground">
              {[
                { title: "Earliest claiming age", body: "Age 62, but with up to 30% permanent reduction from your FRA benefit." },
                { title: "Full Retirement Age (FRA)", body: "Age 67 for anyone born 1960 or later. No reduction, no bonus." },
                { title: "Delayed credits", body: "+8% per year from FRA to 70. Claiming at 70 gives you 124% of your FRA benefit." },
                { title: "Spousal benefit", body: "A non-working spouse can claim up to 50% of the working spouse's PIA." },
                { title: "Survivor benefit", body: "A widow/widower receives up to 100% of the deceased spouse's benefit." },
                { title: "FIRE strategy", body: "Many early retirees bridge with portfolio until 70 to lock in maximum SS — reducing lifetime portfolio risk." },
              ].map((item) => (
                <div key={item.title} className="p-3 rounded-lg bg-secondary/50">
                  <div className="font-medium text-foreground mb-1">{item.title}</div>
                  <div>{item.body}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <NextSteps currentPath="/social-security" />
      <DisclaimerBanner context="social security" />
    </div>
    </PageEnter>
  );
}
