"use client";
import { PageEnter } from "@/components/Animated";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { NextSteps } from "@/components/NextSteps";

import { useMemo, useCallback } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, ReferenceDot,
} from "recharts";
import { SliderInput } from "@/components/SliderInput";
import { ExportBar } from "@/components/ExportBar";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { downloadCSV } from "@/lib/csv";
import { yearsToFire, fireNumber } from "@/lib/calculations/core";

interface SavingsRateInputs {
  currentSavingsRate: number;
  annualIncome: number;
  returnRate: number;
}

const DEFAULT_INPUTS: SavingsRateInputs = {
  currentSavingsRate: 30,
  annualIncome: 100000,
  returnRate: 0.07,
};

export function SavingsRateClient(): React.JSX.Element {
  const [inputs, setInputs, clearInputs] = useLocalStorage<SavingsRateInputs>(
    "reachfire:savings-rate",
    DEFAULT_INPUTS
  );
  const { currentSavingsRate, annualIncome, returnRate } = inputs;
  const setCurrentSavingsRate = (v: number): void => setInputs((prev) => ({ ...prev, currentSavingsRate: v }));
  const setReturnRate = (v: number): void => setInputs((prev) => ({ ...prev, returnRate: v }));

  const chartData = useMemo(() => {
    const points: Array<{ rate: number; years: number }> = [];
    for (let rate = 5; rate <= 90; rate += 1) {
      const annualExpenses = annualIncome * (1 - rate / 100);
      const monthlySavings = (annualIncome * rate) / 100 / 12;
      const fireNum = fireNumber(annualExpenses, 0.04);
      const years = yearsToFire(0, monthlySavings, returnRate, fireNum);
      points.push({ rate, years: Math.min(years, 60) });
    }
    return points;
  }, [annualIncome, returnRate]);

  const currentPoint = chartData.find((d) => d.rate === currentSavingsRate);
  const currentYears = currentPoint?.years ?? 0;

  // Impact of +5%
  const plus5Point = chartData.find((d) => d.rate === Math.min(90, currentSavingsRate + 5));
  const yearsSaved = currentYears && plus5Point ? currentYears - plus5Point.years : 0;

  const handleExportCSV = useCallback(() => {
    const headers = ["Savings Rate (%)", "Years to FIRE"];
    const rows = chartData.map((d) => [d.rate, Number(d.years.toFixed(1))]);
    downloadCSV("reachfire-savings-rate", headers, rows);
  }, [chartData]);

  const avgAmericanRate = 4.6;

  return (
    <PageEnter>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">Savings Rate Impact</h1>
        <p className="text-muted-foreground max-w-2xl">
          The single most powerful lever in FIRE planning. Drag the slider to see how your savings rate determines your FIRE timeline.
        </p>
        <ExportBar
          onExportCSV={handleExportCSV}
          onReset={clearInputs}
          className="no-print mt-3"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="sm:col-span-2">
          <SliderInput
            label="Your Savings Rate"
            value={currentSavingsRate}
            min={5}
            max={90}
            onChange={setCurrentSavingsRate}
            format="percent"
            minLabel="5%"
            maxLabel="90%"
          />
        </div>
        <SliderInput
          label="Expected Return"
          value={returnRate}
          min={0.03}
          max={0.12}
          step={0.005}
          onChange={setReturnRate}
          format="percent"
        />
      </div>

      {/* Big result */}
      <div className="rounded-xl border border-ember bg-card p-6 glow-ember-sm mb-6 text-center">
        <div className="text-5xl font-bold gradient-ember-text tabular-nums mb-2">
          {currentYears >= 60 ? "60+" : currentYears.toFixed(1)} years
        </div>
        <p className="text-muted-foreground">
          At a <strong className="text-foreground">{currentSavingsRate}% savings rate</strong>, you reach FIRE in{" "}
          {currentYears >= 60 ? "more than 60" : currentYears.toFixed(1)} years
        </p>
        {yearsSaved > 0 && (
          <p className="text-sm text-emerald-400 mt-2">
            Increase to {Math.min(90, currentSavingsRate + 5)}% → retire{" "}
            <strong>{yearsSaved.toFixed(1)} years earlier</strong>
          </p>
        )}
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-border bg-card p-5 mb-6">
        <h2 className="font-semibold text-sm mb-4">Savings Rate → Years to FIRE</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="rate"
              tick={{ fontSize: 11 }}
              tickLine={false}
              label={{ value: "Savings Rate (%)", position: "insideBottom", offset: -5, fontSize: 11 }}
            />
            <YAxis
              tick={{ fontSize: 10 }}
              tickLine={false}
              domain={[0, 65]}
              label={{ value: "Years to FIRE", angle: -90, position: "insideLeft", fontSize: 11 }}
            />
            <Tooltip
              formatter={(v: number | undefined) => v !== undefined ? [v.toFixed(1) + " years", "Years to FIRE"] : ""}
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
              }}
            />

            {/* Average American */}
            <ReferenceLine
              x={Math.round(avgAmericanRate)}
              stroke="oklch(0.52 0.18 250)"
              strokeDasharray="3 2"
              label={{ value: "Avg American (4.6%)", position: "right", fontSize: 9, fill: "oklch(0.52 0.18 250)" }}
            />

            {/* Current rate */}
            <ReferenceLine
              x={currentSavingsRate}
              stroke="oklch(0.70 0.24 50)"
              strokeWidth={2}
              strokeDasharray="4 2"
            />

            <Line
              type="monotone"
              dataKey="years"
              stroke="url(#lineGrad)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: "oklch(0.70 0.24 50)" }}
            />

            {/* User's dot */}
            {currentPoint && (
              <ReferenceDot
                x={currentPoint.rate}
                y={currentPoint.years}
                r={8}
                fill="oklch(0.70 0.24 50)"
                stroke="var(--popover)"
                strokeWidth={2}
                label={{
                  value: `${currentSavingsRate}% → ${currentYears.toFixed(1)}yr`,
                  position: "top",
                  fontSize: 10,
                  fill: "oklch(0.70 0.24 50)",
                }}
              />
            )}

            <defs>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="oklch(0.82 0.18 75)" />
                <stop offset="100%" stopColor="oklch(0.62 0.26 35)" />
              </linearGradient>
            </defs>
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Key benchmarks */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { rate: 10, label: "Starter" },
          { rate: 25, label: "Good" },
          { rate: 50, label: "FIRE-focused" },
          { rate: 70, label: "Extreme FIRE" },
        ].map((b) => {
          const point = chartData.find((d) => d.rate === b.rate);
          const isActive = b.rate === currentSavingsRate;
          return (
            <button
              key={b.rate}
              onClick={() => setCurrentSavingsRate(b.rate)}
              className={`rounded-xl border p-4 text-center transition-colors ${
                isActive ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/30"
              }`}
            >
              <div className="text-xl font-bold tabular-nums">{b.rate}%</div>
              <div className="text-xs text-muted-foreground">{b.label}</div>
              <div className="text-sm font-semibold mt-1">
                {point ? `${point.years.toFixed(1)} yrs` : "∞"}
              </div>
            </button>
          );
        })}
      </div>
    </div>
    <NextSteps currentPath="/savings-rate" />
    <DisclaimerBanner />
    </PageEnter>
  );
}
