/**
 * Healthcare cost calculations for FIRE planning
 * Pre-65 ACA marketplace + post-65 Medicare projections
 */

import { ACA_BENCHMARK_PREMIUMS, MEDICARE_COSTS } from '@/lib/data/healthcareCosts';
import { PROCEDURE_COSTS, type ProcedureCostData } from '@/lib/data/medicalTourism';
import { HSA_LIMITS_2025 } from '@/lib/data/taxBrackets';

export interface HealthcareCostProjection {
  age: number;
  year: number;
  annualPremium: number;
  estimatedOutOfPocket: number;
  totalAnnualCost: number;
  isMedicare: boolean;
}

export interface LifetimeHealthcareResult {
  totalCost: number;
  preMedicareCost: number;
  medicareCost: number;
  yearlyProjections: HealthcareCostProjection[];
  averageAnnualCost: number;
}

export interface MedicalTourismSavings {
  procedure: string;
  usCost: number;
  destinationCost: number;
  savings: number;
  savingsPercent: number;
  country: string;
}

export interface HSAProjection {
  year: number;
  age: number;
  contributions: number;
  growth: number;
  balance: number;
  cumulativeContributions: number;
}

/**
 * Estimate ACA marketplace premium by age
 * ACA premiums increase with age (3:1 ratio max)
 * Benchmark state: national average
 */
export function acaPremium(
  age: number,
  annualIncome: number,
  familySize: number = 1,
  state: string = 'national'
): number {
  if (age >= 65) return 0; // Medicare kicks in

  const stateData = ACA_BENCHMARK_PREMIUMS[state] ?? ACA_BENCHMARK_PREMIUMS['national'];

  // Find age band
  const ageBand = stateData.ageBands.find((band) => age >= band.minAge && age <= band.maxAge);

  const basePremium = ageBand
    ? ageBand.monthlyPremium * familySize
    : stateData.ageBands[stateData.ageBands.length - 1].monthlyPremium * familySize;

  // Calculate ACA subsidy (premium tax credit)
  // For incomes 100-400% FPL, cap at certain % of income
  const fpl2025 = familySize === 1 ? 15650 : 15650 + (familySize - 1) * 5540;
  const fplPercent = (annualIncome / fpl2025) * 100;

  let maxPremiumPercent = 0;
  if (fplPercent <= 100)
    maxPremiumPercent = 0; // full subsidy (Medicaid expansion)
  else if (fplPercent <= 133)
    maxPremiumPercent = 0; // Medicaid
  else if (fplPercent <= 150)
    maxPremiumPercent = 0; // enhanced ARP subsidies
  else if (fplPercent <= 200) maxPremiumPercent = 0.02;
  else if (fplPercent <= 250) maxPremiumPercent = 0.04;
  else if (fplPercent <= 300) maxPremiumPercent = 0.06;
  else if (fplPercent <= 400) maxPremiumPercent = 0.085;
  else maxPremiumPercent = 0.085; // capped at 8.5% above 400% FPL (ARP extension)

  const annualPremium = basePremium * 12;
  const maxAfterSubsidy = annualIncome * maxPremiumPercent;

  // Subsidy = full premium minus capped amount (can't go below $0)
  const netAnnualPremium = Math.max(
    0,
    Math.min(annualPremium, maxAfterSubsidy > 0 ? maxAfterSubsidy : annualPremium)
  );

  return netAnnualPremium;
}

/**
 * Estimate Medicare Part B + Part D premium by income (IRMAA)
 */
export function medicarePremium(annualIncome: number): number {
  const { partB, partD } = MEDICARE_COSTS;

  // IRMAA brackets for 2025 (single filer)
  let partBMonthly = partB.baseMonthly;
  if (annualIncome > 106000 && annualIncome <= 133000) partBMonthly = 259.6;
  else if (annualIncome > 133000 && annualIncome <= 167000) partBMonthly = 370.2;
  else if (annualIncome > 167000 && annualIncome <= 200000) partBMonthly = 480.9;
  else if (annualIncome > 200000 && annualIncome <= 500000) partBMonthly = 591.6;
  else if (annualIncome > 500000) partBMonthly = 628.9;

  const partBannual = partBMonthly * 12;
  const partDannual = partD.avgMonthlyPremium * 12;
  const supplementalAnnual = partB.avgSupplementalAnnual; // Medigap/Medicare Advantage

  return partBannual + partDannual + supplementalAnnual;
}

/**
 * Project HSA balance over time
 */
export function hsaProjection(
  currentBalance: number,
  currentAge: number,
  annualContribution: number,
  returnRate: number,
  years: number,
  isFamilyPlan: boolean = false
): HSAProjection[] {
  const maxContrib = isFamilyPlan ? HSA_LIMITS_2025.family : HSA_LIMITS_2025.individual;
  const catchupLimit = currentAge >= 55 ? HSA_LIMITS_2025.catchup_55_plus : 0;
  const effectiveContrib = Math.min(annualContribution, maxContrib + catchupLimit);

  const projections: HSAProjection[] = [];
  let balance = currentBalance;
  let cumulativeContributions = 0;

  for (let year = 1; year <= years; year++) {
    const yearContrib =
      currentAge + year - 1 >= 55
        ? effectiveContrib + HSA_LIMITS_2025.catchup_55_plus
        : effectiveContrib;
    const growth = (balance + yearContrib) * returnRate;
    balance = balance + yearContrib + growth;
    cumulativeContributions += yearContrib;

    projections.push({
      year,
      age: currentAge + year,
      contributions: yearContrib,
      growth,
      balance,
      cumulativeContributions,
    });
  }

  return projections;
}

/**
 * Project lifetime healthcare costs from retirement age to life expectancy
 */
export function lifetimeHealthcareCost(
  currentAge: number,
  retirementAge: number,
  lifeExpectancy: number = 90,
  annualIncome: number = 50000,
  familySize: number = 1,
  inflationRate: number = 0.055, // healthcare inflation ~5.5%
  state: string = 'national'
): LifetimeHealthcareResult {
  const yearlyProjections: HealthcareCostProjection[] = [];
  const currentYear = new Date().getFullYear();
  let totalCost = 0;
  let preMedicareCost = 0;
  let medicareCost = 0;

  for (let age = retirementAge; age <= lifeExpectancy; age++) {
    const yearsFromNow = age - currentAge;
    const year = currentYear + yearsFromNow;
    const isMedicare = age >= 65;
    const yearsFromRetirement = age - retirementAge;
    const inflationFactor = Math.pow(1 + inflationRate, yearsFromRetirement);

    let annualPremium = 0;
    let estimatedOop = 0;

    if (!isMedicare) {
      annualPremium = acaPremium(age, annualIncome, familySize, state) * inflationFactor;
      estimatedOop = 4000 * inflationFactor; // avg OOP for ACA plans
    } else {
      annualPremium = medicarePremium(annualIncome) * inflationFactor;
      estimatedOop = 2500 * inflationFactor; // avg Medicare OOP
    }

    const totalAnnualCost = annualPremium + estimatedOop;

    yearlyProjections.push({
      age,
      year,
      annualPremium,
      estimatedOutOfPocket: estimatedOop,
      totalAnnualCost,
      isMedicare,
    });

    totalCost += totalAnnualCost;
    if (!isMedicare) preMedicareCost += totalAnnualCost;
    else medicareCost += totalAnnualCost;
  }

  const totalYears = lifeExpectancy - retirementAge + 1;

  return {
    totalCost,
    preMedicareCost,
    medicareCost,
    yearlyProjections,
    averageAnnualCost: totalCost / totalYears,
  };
}

/**
 * Calculate medical tourism savings for common procedures
 */
export function medicalTourismSavings(
  procedureIds: string[],
  countryId: string
): MedicalTourismSavings[] {
  const results: MedicalTourismSavings[] = [];

  for (const procedureId of procedureIds) {
    const procedure = PROCEDURE_COSTS.find((p: ProcedureCostData) => p.id === procedureId);
    if (!procedure) continue;

    const usCost = procedure.usCost;
    const destination = procedure.international.find(
      (d: { countryId: string; cost: number }) => d.countryId === countryId
    );
    if (!destination) continue;

    const savings = usCost - destination.cost;
    results.push({
      procedure: procedure.name,
      usCost,
      destinationCost: destination.cost,
      savings,
      savingsPercent: (savings / usCost) * 100,
      country: destination.countryId,
    });
  }

  return results;
}
