/**
 * Tax calculation functions for FIRE planning
 * Uses 2025 federal tax brackets
 */

import type { FilingStatus } from '@/types/fire';
import {
  TAX_BRACKETS_2025,
  CAPITAL_GAINS_BRACKETS_2025,
  STANDARD_DEDUCTION_2025,
} from '@/lib/data/taxBrackets';
import type { RothLadderPlan, RothLadderRung, RothLadderYearlyPlan } from '@/types/fire';

/**
 * Calculate federal income tax on taxable income (after deductions)
 */
export function federalTaxOnIncome(taxableIncome: number, filingStatus: FilingStatus): number {
  if (taxableIncome <= 0) return 0;
  const brackets = TAX_BRACKETS_2025[filingStatus];
  let tax = 0;

  for (const bracket of brackets) {
    if (taxableIncome <= bracket.min) break;
    const top = bracket.max !== null ? Math.min(taxableIncome, bracket.max) : taxableIncome;
    tax += (top - bracket.min) * bracket.rate;
  }

  return tax;
}

/**
 * Calculate federal tax on gross income (applies standard deduction)
 */
export function federalTax(grossIncome: number, filingStatus: FilingStatus): number {
  if (grossIncome <= 0) return 0;
  const deduction = STANDARD_DEDUCTION_2025[filingStatus];
  const taxableIncome = Math.max(0, grossIncome - deduction);
  return federalTaxOnIncome(taxableIncome, filingStatus);
}

/**
 * Calculate effective tax rate
 */
export function effectiveTaxRate(grossIncome: number, filingStatus: FilingStatus): number {
  if (grossIncome <= 0) return 0;
  return federalTax(grossIncome, filingStatus) / grossIncome;
}

/**
 * Calculate marginal tax rate at a given income
 */
export function marginalTaxRate(grossIncome: number, filingStatus: FilingStatus): number {
  if (grossIncome <= 0) return 0;
  const deduction = STANDARD_DEDUCTION_2025[filingStatus];
  const taxableIncome = Math.max(0, grossIncome - deduction);
  const brackets = TAX_BRACKETS_2025[filingStatus];

  for (let i = brackets.length - 1; i >= 0; i--) {
    if (taxableIncome > brackets[i].min) return brackets[i].rate;
  }
  return brackets[0].rate;
}

/**
 * Calculate tax on a Roth conversion
 * @param conversionAmount - Amount to convert from traditional IRA
 * @param otherIncome - Other income (SS, part-time, etc.)
 * @param filingStatus - Tax filing status
 */
export function rothConversionTax(
  conversionAmount: number,
  otherIncome: number,
  filingStatus: FilingStatus
): number {
  if (conversionAmount <= 0) return 0;
  const totalIncome = otherIncome + conversionAmount;
  const taxWithConversion = federalTax(totalIncome, filingStatus);
  const taxWithoutConversion = federalTax(otherIncome, filingStatus);
  return Math.max(0, taxWithConversion - taxWithoutConversion);
}

/**
 * Find optimal Roth conversion amount to fill up to a target bracket
 * Returns the maximum conversion amount that stays within the target bracket
 */
export function optimalConversionAmount(
  otherIncome: number,
  targetTopRate: number,
  filingStatus: FilingStatus
): number {
  const brackets = TAX_BRACKETS_2025[filingStatus];
  const deduction = STANDARD_DEDUCTION_2025[filingStatus];
  const otherTaxableIncome = Math.max(0, otherIncome - deduction);

  // Find the bracket ceiling for the target rate
  const targetBracket = brackets.find((b) => b.rate === targetTopRate);
  if (!targetBracket) return 0;

  const bracketCeiling = targetBracket.max ?? Infinity;
  const roomInBracket = Math.max(0, bracketCeiling - otherTaxableIncome);

  return roomInBracket;
}

/**
 * Calculate capital gains tax
 */
export function capitalGainsTax(
  gainAmount: number,
  ordinaryIncome: number,
  filingStatus: FilingStatus
): number {
  if (gainAmount <= 0) return 0;
  const brackets = CAPITAL_GAINS_BRACKETS_2025[filingStatus];
  const totalIncome = ordinaryIncome + gainAmount;
  let tax = 0;

  for (const bracket of brackets) {
    if (totalIncome <= bracket.min) break;
    // Only the portion above ordinaryIncome is gains
    const bracketTop = bracket.max !== null ? bracket.max : totalIncome;
    const taxableGainsInBracket = Math.max(
      0,
      Math.min(gainAmount, bracketTop - Math.max(bracket.min, ordinaryIncome))
    );
    tax += taxableGainsInBracket * bracket.rate;
  }

  return tax;
}

/**
 * Build a Roth conversion ladder plan
 * Assumes early retirement (pre-59.5) and conversions starting immediately
 */
export function rothLadder(
  traditionalBalance: number,
  annualExpenses: number,
  targetTopBracketRate: number,
  filingStatus: FilingStatus,
  currentAge: number,
  _returnRate: number = 0.07,
  years: number = 20
): RothLadderPlan {
  const SEASONING_YEARS = 5;

  const rungs: RothLadderRung[] = [];
  const yearByYear: RothLadderYearlyPlan[] = [];

  let remainingTraditional = traditionalBalance;
  let totalTaxPaid = 0;
  const bridgeFundRequired = annualExpenses * SEASONING_YEARS;

  for (let i = 0; i < years && remainingTraditional > 0; i++) {
    const age = currentAge + i;
    const year = new Date().getFullYear() + i;

    // How much can we convert within the target bracket?
    const maxConversion = optimalConversionAmount(0, targetTopBracketRate, filingStatus);
    const conversionAmount = Math.min(maxConversion, remainingTraditional, annualExpenses * 2);

    if (conversionAmount <= 0) break;

    const taxOnConversion = rothConversionTax(conversionAmount, 0, filingStatus);
    const availableYear = year + SEASONING_YEARS;
    const availableAge = age + SEASONING_YEARS;

    const rung: RothLadderRung = {
      conversionYear: year,
      conversionAge: age,
      conversionAmount,
      taxOnConversion,
      availableYear,
      availableAge,
    };

    rungs.push(rung);
    remainingTraditional -= conversionAmount;
    totalTaxPaid += taxOnConversion;

    // Determine income sources for this year
    const incomeFromRoth = i >= SEASONING_YEARS ? rungs[i - SEASONING_YEARS].conversionAmount : 0;
    const incomeFromTraditional = Math.max(0, annualExpenses - incomeFromRoth);

    yearByYear.push({
      year,
      age,
      conversionAmount,
      taxPaid: taxOnConversion,
      incomeFromTraditional,
      incomeFromRoth,
      taxBracket: targetTopBracketRate,
    });
  }

  // Estimate tax savings vs leaving in traditional (taxed at higher rates in retirement)
  const withdrawalTaxWithoutLadder = federalTax(annualExpenses, filingStatus) * years;
  const totalTaxSaved = Math.max(0, withdrawalTaxWithoutLadder - totalTaxPaid);

  return {
    rungs,
    bridgeFundRequired,
    totalTaxPaid,
    totalTaxSaved,
    yearByYear,
  };
}
