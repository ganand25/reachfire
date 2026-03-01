/**
 * Core FIRE calculation functions
 * All functions are pure (no side effects) with explicit return types
 */

import type { FIREType, YearlyProjection } from "@/types/fire";

/**
 * Calculate the FIRE number (target portfolio value)
 * Based on the Trinity Study: 25× expenses = 4% safe withdrawal rate
 */
export function fireNumber(
  annualExpenses: number,
  withdrawalRate: number = 0.04
): number {
  if (withdrawalRate <= 0) return Infinity;
  return annualExpenses / withdrawalRate;
}

/**
 * Calculate years to reach FIRE number
 * Uses the future value formula with monthly contributions
 */
export function yearsToFire(
  currentSavings: number,
  monthlySavings: number,
  annualReturn: number,
  targetFireNumber: number
): number {
  if (currentSavings >= targetFireNumber) return 0;
  if (monthlySavings <= 0 && annualReturn <= 0) return Infinity;

  // Binary search for years (handles edge cases better than closed-form)
  let low = 0;
  let high = 100;

  // Check if it's even achievable in 100 years
  const maxValue = projectedPortfolio(currentSavings, monthlySavings, annualReturn, 100);
  if (maxValue < targetFireNumber) return Infinity;

  for (let i = 0; i < 60; i++) {
    const mid = (low + high) / 2;
    const value = projectedPortfolio(currentSavings, monthlySavings, annualReturn, mid);
    if (value < targetFireNumber) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return (low + high) / 2;
}

/**
 * Project portfolio value after n years with monthly contributions
 */
export function projectedPortfolio(
  currentValue: number,
  monthlySavings: number,
  annualReturn: number,
  years: number
): number {
  const monthlyReturn = annualReturn / 12;
  const months = years * 12;

  if (monthlyReturn === 0) {
    return currentValue + monthlySavings * months;
  }

  // FV = PV * (1+r)^n + PMT * ((1+r)^n - 1) / r
  const growthFactor = Math.pow(1 + monthlyReturn, months);
  return (
    currentValue * growthFactor +
    monthlySavings * ((growthFactor - 1) / monthlyReturn)
  );
}

/**
 * Calculate the FIRE date given years to FIRE
 */
export function fireDate(
  yearsToFireValue: number,
  currentDate: Date = new Date()
): Date {
  const date = new Date(currentDate);
  const totalMonths = Math.round(yearsToFireValue * 12);
  date.setMonth(date.getMonth() + totalMonths);
  return date;
}

/**
 * Build a year-by-year projection array
 */
export function projectedGrowth(
  currentSavings: number,
  monthlySavings: number,
  annualReturn: number,
  years: number,
  inflationRate: number = 0.03,
  currentAge: number = 30
): YearlyProjection[] {
  const projections: YearlyProjection[] = [];
  let portfolio = currentSavings;
  const monthlyReturn = annualReturn / 12;

  for (let year = 1; year <= Math.ceil(years); year++) {
    const previousPortfolio = portfolio;
    const months = year === Math.ceil(years) ? (years % 1) * 12 || 12 : 12;

    for (let m = 0; m < months; m++) {
      portfolio = portfolio * (1 + monthlyReturn) + monthlySavings;
    }

    const contributions = monthlySavings * months;
    const growthAmount = portfolio - previousPortfolio - contributions;
    const inflationFactor = Math.pow(1 + inflationRate, year);

    projections.push({
      year,
      age: currentAge + year,
      portfolioValue: portfolio,
      contributions,
      growthAmount,
      inflationAdjusted: portfolio / inflationFactor,
    });
  }

  return projections;
}

/**
 * Calculate savings rate as a percentage
 */
export function savingsRate(
  grossIncome: number,
  totalExpenses: number
): number {
  if (grossIncome <= 0) return 0;
  const savings = grossIncome - totalExpenses;
  return Math.max(0, Math.min(100, (savings / grossIncome) * 100));
}

/**
 * Adjust an amount for inflation over time
 */
export function inflationAdjust(
  amount: number,
  inflationRate: number,
  years: number
): number {
  return amount / Math.pow(1 + inflationRate, years);
}

/**
 * Calculate real return rate (Fisher equation)
 * Real return = (1 + nominal) / (1 + inflation) - 1
 */
export function realReturnRate(
  nominalReturn: number,
  inflationRate: number
): number {
  return (1 + nominalReturn) / (1 + inflationRate) - 1;
}

/**
 * Classify FIRE type based on annual expenses and FIRE number
 */
export function classifyFIREType(
  annualExpenses: number,
  _withdrawalRate: number = 0.04
): FIREType {
  // Lean FIRE: < $40K/year
  // Regular FIRE: $40K–$100K/year
  // Fat FIRE: > $100K/year
  if (annualExpenses < 40000) return "lean_fire";
  if (annualExpenses <= 100000) return "regular_fire";
  return "fat_fire";
}

/**
 * Rule of 72: years to double money
 */
export function yearsToDouble(annualReturn: number): number {
  if (annualReturn <= 0) return Infinity;
  return 72 / (annualReturn * 100);
}

/**
 * Monthly savings needed to reach a goal in N years
 */
export function monthlySavingsNeeded(
  currentSavings: number,
  targetAmount: number,
  annualReturn: number,
  years: number
): number {
  if (years <= 0) return Infinity;
  const monthlyReturn = annualReturn / 12;
  const months = years * 12;

  if (monthlyReturn === 0) {
    return (targetAmount - currentSavings) / months;
  }

  const growthFactor = Math.pow(1 + monthlyReturn, months);
  const futureCurrentSavings = currentSavings * growthFactor;

  if (futureCurrentSavings >= targetAmount) return 0;

  return ((targetAmount - futureCurrentSavings) * monthlyReturn) / (growthFactor - 1);
}

/**
 * Calculate FIRE number for different scenarios
 */
export interface FIREScenarios {
  lean: number;
  regular: number;
  fat: number;
  barista: number; // 15× expenses (partial income supplement)
}

export function calculateFIREScenarios(annualExpenses: number): FIREScenarios {
  return {
    lean: fireNumber(annualExpenses * 0.7, 0.04), // lean lifestyle = 70% of expenses
    regular: fireNumber(annualExpenses, 0.04),
    fat: fireNumber(annualExpenses * 1.5, 0.04), // fat = 150% of expenses
    barista: fireNumber(annualExpenses * 0.6, 0.04), // barista = 60% (supplement with part-time)
  };
}

/**
 * Calculate the impact of expense reduction on FIRE timeline
 */
export function expenseReductionImpact(
  currentParams: {
    currentSavings: number;
    monthlyIncome: number;
    currentMonthlyExpenses: number;
    annualReturn: number;
    withdrawalRate: number;
  },
  monthlyExpenseReduction: number
): { newYearsToFire: number; monthsEarlier: number; newFireNumber: number } {
  const {
    currentSavings,
    monthlyIncome,
    currentMonthlyExpenses,
    annualReturn,
    withdrawalRate,
  } = currentParams;

  const currentAnnualExpenses = currentMonthlyExpenses * 12;
  const newAnnualExpenses = (currentMonthlyExpenses - monthlyExpenseReduction) * 12;

  const currentMonthlySavings = monthlyIncome - currentMonthlyExpenses;
  const newMonthlySavings = currentMonthlySavings + monthlyExpenseReduction;

  const currentFireNum = fireNumber(currentAnnualExpenses, withdrawalRate);
  const newFireNum = fireNumber(newAnnualExpenses, withdrawalRate);

  const currentYears = yearsToFire(currentSavings, currentMonthlySavings, annualReturn, currentFireNum);
  const newYears = yearsToFire(currentSavings, newMonthlySavings, annualReturn, newFireNum);

  return {
    newYearsToFire: newYears,
    monthsEarlier: Math.round((currentYears - newYears) * 12),
    newFireNumber: newFireNum,
  };
}
