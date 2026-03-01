/**
 * Coast FIRE calculations
 * Coast FIRE: Save until a point where compound growth alone reaches the FIRE number
 */

import type { CoastFIREResult } from "@/types/fire";
import { fireNumber, projectedPortfolio } from "./core";

/**
 * Calculate the portfolio needed today to coast to FIRE by retirement age
 * Formula: FIRE Number / (1 + return)^(retirementAge - currentAge)
 */
export function coastFireNumber(
  annualExpenses: number,
  currentAge: number,
  targetRetirementAge: number,
  withdrawalRate: number = 0.04,
  returnRate: number = 0.07
): number {
  const fireNum = fireNumber(annualExpenses, withdrawalRate);
  const yearsToGrow = targetRetirementAge - currentAge;
  if (yearsToGrow <= 0) return fireNum;
  return fireNum / Math.pow(1 + returnRate, yearsToGrow);
}

/**
 * Find the age at which you can stop saving (coast age)
 * Given current savings and monthly contribution, when will the portfolio
 * reach the coast number?
 */
export function coastFireAge(
  currentAge: number,
  currentSavings: number,
  monthlySavings: number,
  targetRetirementAge: number,
  annualExpenses: number,
  withdrawalRate: number = 0.04,
  returnRate: number = 0.07
): number | null {
  // Check if we already have enough to coast
  const currentCoastNum = coastFireNumber(
    annualExpenses,
    currentAge,
    targetRetirementAge,
    withdrawalRate,
    returnRate
  );

  if (currentSavings >= currentCoastNum) return currentAge;

  // Find the age where we can stop saving
  for (let age = currentAge + 1; age <= targetRetirementAge; age++) {
    const yearsOfSaving = age - currentAge;
    const portfolioAtAge = projectedPortfolio(
      currentSavings,
      monthlySavings,
      returnRate,
      yearsOfSaving
    );

    const coastNumAtAge = coastFireNumber(
      annualExpenses,
      age,
      targetRetirementAge,
      withdrawalRate,
      returnRate
    );

    if (portfolioAtAge >= coastNumAtAge) {
      // Interpolate for fractional year
      if (age > currentAge + 1) {
        const prevPortfolio = projectedPortfolio(
          currentSavings,
          monthlySavings,
          returnRate,
          yearsOfSaving - 1
        );
        const fraction =
          (currentCoastNum - prevPortfolio) /
          (portfolioAtAge - prevPortfolio);
        return age - 1 + Math.max(0, Math.min(1, fraction));
      }
      return age;
    }
  }

  return null; // Cannot reach coast FIRE by retirement age
}

/**
 * Full Coast FIRE analysis
 */
export function analyzeCoastFire(
  currentAge: number,
  currentSavings: number,
  monthlySavings: number,
  targetRetirementAge: number,
  annualExpenses: number,
  withdrawalRate: number = 0.04,
  returnRate: number = 0.07
): CoastFIREResult {
  const coastNum = coastFireNumber(
    annualExpenses,
    currentAge,
    targetRetirementAge,
    withdrawalRate,
    returnRate
  );

  const currentProgress = Math.min(100, (currentSavings / coastNum) * 100);

  const coastAge = coastFireAge(
    currentAge,
    currentSavings,
    monthlySavings,
    targetRetirementAge,
    annualExpenses,
    withdrawalRate,
    returnRate
  );

  const yearsToCoastAge = coastAge !== null ? Math.max(0, coastAge - currentAge) : 0;

  // Project what the portfolio will be at retirement
  const portfolioAtCoast =
    coastAge !== null
      ? projectedPortfolio(currentSavings, monthlySavings, returnRate, yearsToCoastAge)
      : currentSavings;

  const yearsCoasting = targetRetirementAge - (coastAge ?? targetRetirementAge);
  const projectedRetirementPortfolio = portfolioAtCoast * Math.pow(1 + returnRate, yearsCoasting);

  return {
    coastAge: coastAge ?? targetRetirementAge,
    coastNumber: coastNum,
    currentProgress,
    yearsToCoastAge,
    projectedRetirementPortfolio,
  };
}

/**
 * Calculate bridge fund needed for early retirement
 * (accessible funds before age 59.5 to cover the gap years)
 */
export function bridgeFundNeeded(
  annualExpenses: number,
  retirementAge: number,
  traditionalAccessAge: number = 59.5,
  inflationRate: number = 0.03,
  returnRate: number = 0.05 // conservative for accessible accounts
): number {
  const gapYears = Math.max(0, traditionalAccessAge - retirementAge);
  if (gapYears <= 0) return 0;

  // PV of expense stream for gap years (inflation-adjusted)
  let total = 0;
  for (let year = 0; year < gapYears; year++) {
    const inflatedExpenses = annualExpenses * Math.pow(1 + inflationRate, year);
    const discountFactor = Math.pow(1 + returnRate, year);
    total += inflatedExpenses / discountFactor;
  }

  return total;
}
