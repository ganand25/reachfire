/**
 * "One Decision" impact calculator
 * Show compound effect of lifestyle changes on FIRE timeline
 */

import type { LifestyleDecision, DecisionImpact } from "@/types/fire";
import { yearsToFire, fireNumber } from "./core";

/**
 * Calculate future value of monthly savings over time
 */
export function compoundImpact(
  monthlySavings: number,
  annualReturn: number,
  years: number
): number {
  if (monthlySavings <= 0) return 0;
  const monthlyReturn = annualReturn / 12;
  const months = years * 12;
  if (monthlyReturn === 0) return monthlySavings * months;
  return monthlySavings * ((Math.pow(1 + monthlyReturn, months) - 1) / monthlyReturn);
}

/**
 * Calculate how many months earlier a decision brings FIRE
 */
export function fireImpactMonths(
  monthlySavings: number,
  currentPortfolio: number,
  currentMonthlySavings: number,
  annualExpenses: number,
  annualReturn: number,
  withdrawalRate: number = 0.04
): number {
  const fireNum = fireNumber(annualExpenses, withdrawalRate);
  const currentYears = yearsToFire(currentPortfolio, currentMonthlySavings, annualReturn, fireNum);
  const newYears = yearsToFire(currentPortfolio, currentMonthlySavings + monthlySavings, annualReturn, fireNum);
  return Math.max(0, Math.round((currentYears - newYears) * 12));
}

/**
 * Analyze a lifestyle decision's full impact
 */
export function analyzeDecision(
  decision: LifestyleDecision,
  currentPortfolio: number,
  currentMonthlySavings: number,
  annualExpenses: number,
  annualReturn: number,
  withdrawalRate: number = 0.04
): DecisionImpact {
  const { monthlySavings } = decision;

  return {
    decision,
    year5Value: compoundImpact(monthlySavings, annualReturn, 5),
    year10Value: compoundImpact(monthlySavings, annualReturn, 10),
    year20Value: compoundImpact(monthlySavings, annualReturn, 20),
    year30Value: compoundImpact(monthlySavings, annualReturn, 30),
    monthsEarlierToFire: fireImpactMonths(
      monthlySavings,
      currentPortfolio,
      currentMonthlySavings,
      annualExpenses,
      annualReturn,
      withdrawalRate
    ),
  };
}

/**
 * Preset lifestyle decisions with default savings amounts
 */
export const PRESET_DECISIONS: LifestyleDecision[] = [
  {
    id: "coffee",
    label: "Make coffee at home",
    description: "Skip the $5/day coffee shop habit",
    monthlySavings: 150,
    category: "food",
  },
  {
    id: "subscriptions",
    label: "Cancel unused subscriptions",
    description: "Cut streaming, apps, and memberships you rarely use",
    monthlySavings: 100,
    category: "subscriptions",
  },
  {
    id: "bike-commute",
    label: "Bike or transit to work",
    description: "Eliminate car costs: gas, parking, and maintenance",
    monthlySavings: 350,
    category: "transport",
  },
  {
    id: "house-hack",
    label: "House hack — rent a room",
    description: "Rent a spare room or basement apartment",
    monthlySavings: 900,
    category: "housing",
  },
  {
    id: "meal-prep",
    label: "Meal prep instead of restaurants",
    description: "Cut dining out from daily to weekends only",
    monthlySavings: 400,
    category: "food",
  },
  {
    id: "index-funds",
    label: "Switch to index funds",
    description: "Save 1% in fund fees — the silent wealth killer",
    monthlySavings: 83, // ~$100K portfolio at 1% = $1000/yr = $83/mo
    category: "investing",
  },
  {
    id: "negotiate-salary",
    label: "Negotiate a 10% raise",
    description: "A single salary negotiation compounds for decades",
    monthlySavings: 625, // ~$75K salary at 10% = $7500/yr = $625/mo
    category: "income",
  },
  {
    id: "electric-vehicle",
    label: "Go electric vehicle",
    description: "Lower fuel and maintenance costs vs gas vehicle",
    monthlySavings: 200,
    category: "transport",
  },
  {
    id: "gym-cancel",
    label: "Cancel gym — exercise outside",
    description: "Running, cycling, or bodyweight training at home",
    monthlySavings: 60,
    category: "subscriptions",
  },
  {
    id: "side-hustle",
    label: "Start a side hustle",
    description: "Freelancing, consulting, or selling online",
    monthlySavings: 500,
    category: "income",
  },
];

/**
 * Calculate cumulative impact of multiple decisions
 */
export function combinedDecisionImpact(
  decisions: LifestyleDecision[],
  currentPortfolio: number,
  currentMonthlySavings: number,
  annualExpenses: number,
  annualReturn: number,
  withdrawalRate: number = 0.04
): {
  totalMonthlySavings: number;
  year5Total: number;
  year10Total: number;
  year20Total: number;
  year30Total: number;
  totalMonthsEarlier: number;
} {
  const totalMonthly = decisions.reduce((sum, d) => sum + d.monthlySavings, 0);

  return {
    totalMonthlySavings: totalMonthly,
    year5Total: compoundImpact(totalMonthly, annualReturn, 5),
    year10Total: compoundImpact(totalMonthly, annualReturn, 10),
    year20Total: compoundImpact(totalMonthly, annualReturn, 20),
    year30Total: compoundImpact(totalMonthly, annualReturn, 30),
    totalMonthsEarlier: fireImpactMonths(
      totalMonthly,
      currentPortfolio,
      currentMonthlySavings,
      annualExpenses,
      annualReturn,
      withdrawalRate
    ),
  };
}
