'use client';

import { useState, useMemo } from 'react';
import { yearsToFire, fireNumber } from '@/lib/calculations/core';

export function LandingTeaser(): React.JSX.Element {
  const [savingsRate, setSavingsRate] = useState(30);

  const { years, targetPortfolio } = useMemo(() => {
    const annualIncome = 100000;
    const annualExpenses = annualIncome * (1 - savingsRate / 100);
    const monthlySavings = (annualIncome * savingsRate) / 100 / 12;
    const fireNum = fireNumber(annualExpenses, 0.04);
    const yrs = yearsToFire(0, monthlySavings, 0.07, fireNum);
    return { years: Math.min(yrs, 60), targetPortfolio: fireNum };
  }, [savingsRate]);

  const yearsLabel = years >= 60 ? '60+ years' : `${years.toFixed(1)} years`;
  const portfolioLabel =
    targetPortfolio >= 1_000_000
      ? `$${(targetPortfolio / 1_000_000).toFixed(2)}M`
      : `$${(targetPortfolio / 1_000).toFixed(0)}K`;

  const fireDate = new Date();
  fireDate.setFullYear(fireDate.getFullYear() + Math.round(years));
  const fireDateLabel = years >= 60 ? '—' : String(fireDate.getFullYear());

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-border bg-card/80 backdrop-blur p-6 text-left">
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4 font-medium">
        Quick FIRE estimate — $100K income
      </p>

      {/* Slider */}
      <div className="space-y-2 mb-6">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium">Savings Rate</label>
          <span className="text-2xl font-bold gradient-ember-text tabular-nums">
            {savingsRate}%
          </span>
        </div>
        <input
          type="range"
          min={5}
          max={90}
          step={1}
          value={savingsRate}
          onChange={(e) => setSavingsRate(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, var(--ember-1) 0%, var(--ember-2) ${((savingsRate - 5) / 85) * 50}%, var(--ember-3) ${((savingsRate - 5) / 85) * 100}%, var(--border) ${((savingsRate - 5) / 85) * 100}%)`,
          }}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>5% (avg American)</span>
          <span>90% (extreme FIRE)</span>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 rounded-xl bg-background/80 border border-border">
          <p className="text-xl font-bold tabular-nums">{yearsLabel}</p>
          <p className="text-xs text-muted-foreground mt-1">to FIRE</p>
        </div>
        <div className="text-center p-3 rounded-xl gradient-ember border-0">
          <p className="text-xl font-bold text-white tabular-nums">{fireDateLabel}</p>
          <p className="text-xs text-white/70 mt-1">FIRE year</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-background/80 border border-border">
          <p className="text-xl font-bold tabular-nums">{portfolioLabel}</p>
          <p className="text-xs text-muted-foreground mt-1">FIRE target</p>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-4">
        Assumes 7% return · 4% withdrawal · starting from $0
      </p>
    </div>
  );
}
