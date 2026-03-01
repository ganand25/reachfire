/**
 * Social Security optimization calculations
 *
 * Key concepts:
 * - Full Retirement Age (FRA): 67 for those born 1960+
 * - Early claiming (62): reduces benefit by up to 30%
 * - Delayed credits (68-70): +8% per year past FRA
 * - Spousal benefit: up to 50% of partner's PIA
 * - Survivor benefit: up to 100% of deceased partner's benefit
 */

export interface SocialSecurityParams {
  currentAge: number;
  monthlyEarningsHistory: number; // avg monthly earnings (used to estimate PIA)
  fra: number; // full retirement age (67 for most)
  spouseMonthlyEarnings?: number; // avg monthly earnings for spouse
  spouseAge?: number;
  spouseFra?: number;
}

export interface ClaimingScenario {
  claimAge: number;
  monthlyBenefit: number;
  annualBenefit: number;
  lifetimeBenefit: number; // to age 90
  breakevenAge: number | null; // age at which this beats claiming at 62
}

export interface SocialSecurityResult {
  pia: number; // Primary Insurance Amount (benefit at FRA)
  scenarios: ClaimingScenario[];
  optimalAge: number; // optimal claiming age (ignoring health)
  monthlyAt62: number;
  monthlyAtFra: number;
  monthlyAt70: number;
  spouseBenefit: number | null;
  totalHouseholdAt70: number | null;
}

/**
 * Estimate PIA from average monthly earnings.
 * Uses 2024 bend points: 90% of first $1,174, 32% of next $5,904, 15% above $7,078.
 */
export function estimatePIA(avgMonthlyEarnings: number): number {
  const BEND1 = 1174;
  const BEND2 = 7078;

  let pia = 0;
  if (avgMonthlyEarnings <= BEND1) {
    pia = avgMonthlyEarnings * 0.9;
  } else if (avgMonthlyEarnings <= BEND2) {
    pia = BEND1 * 0.9 + (avgMonthlyEarnings - BEND1) * 0.32;
  } else {
    pia = BEND1 * 0.9 + (BEND2 - BEND1) * 0.32 + (avgMonthlyEarnings - BEND2) * 0.15;
  }
  return Math.round(pia);
}

/**
 * Monthly benefit based on claiming age vs FRA.
 * - Each month early (before FRA): -5/9% for first 36 months, -5/12% beyond
 * - Each year delayed past FRA (up to 70): +8%
 */
export function monthlyBenefitAtAge(pia: number, claimAge: number, fra: number): number {
  const monthsDiff = Math.round((claimAge - fra) * 12);

  if (monthsDiff === 0) return pia;

  if (monthsDiff > 0) {
    // Delayed credits: +8% per year, max to age 70
    const delayedYears = Math.min(claimAge - fra, 70 - fra);
    return Math.round(pia * (1 + 0.08 * delayedYears));
  }

  // Early reduction
  const monthsEarly = Math.abs(monthsDiff);
  let reduction = 0;
  if (monthsEarly <= 36) {
    reduction = monthsEarly * (5 / 9 / 100);
  } else {
    reduction = 36 * (5 / 9 / 100) + (monthsEarly - 36) * (5 / 12 / 100);
  }
  return Math.round(pia * (1 - reduction));
}

/**
 * Total lifetime benefit if claimed at a given age, assuming living to 90.
 */
function lifetimeBenefit(monthly: number, claimAge: number, lifeExpectancy = 90): number {
  const yearsCollecting = Math.max(0, lifeExpectancy - claimAge);
  return monthly * 12 * yearsCollecting;
}

/**
 * Age at which claiming at `compareAge` beats claiming at 62.
 */
function breakevenVs62(
  monthly62: number,
  monthlyCompare: number,
  claimAge62 = 62,
  compareAge: number
): number | null {
  if (monthlyCompare <= monthly62) return null;

  // Cumulative at 62 start: monthly62 * (currentAge - 62) * 12
  // Cumulative at compareAge start: monthlyCompare * (currentAge - compareAge) * 12
  // Find age where they cross
  // 62_total = monthly62 * 12 * (age - 62)
  // compare_total = monthlyCompare * 12 * (age - compareAge)
  // monthly62 * (age - 62) = monthlyCompare * (age - compareAge)
  // monthly62 * age - monthly62 * 62 = monthlyCompare * age - monthlyCompare * compareAge
  // age * (monthly62 - monthlyCompare) = monthly62 * 62 - monthlyCompare * compareAge
  // age = (monthly62 * 62 - monthlyCompare * compareAge) / (monthly62 - monthlyCompare)

  const numerator = monthly62 * claimAge62 - monthlyCompare * compareAge;
  const denominator = monthly62 - monthlyCompare;
  const breakevenAge = numerator / denominator;

  if (breakevenAge > 90 || breakevenAge < compareAge) return null;
  return Math.round(breakevenAge * 10) / 10;
}

export function analyzeSocialSecurity(params: SocialSecurityParams): SocialSecurityResult {
  const { monthlyEarningsHistory, fra, spouseMonthlyEarnings, spouseAge } = params;

  const pia = estimatePIA(monthlyEarningsHistory);

  // Build scenarios for ages 62–70
  const claimAges = [62, 63, 64, 65, 66, 67, 68, 69, 70];
  const monthly62 = monthlyBenefitAtAge(pia, 62, fra);

  const scenarios: ClaimingScenario[] = claimAges.map((age) => {
    const monthly = monthlyBenefitAtAge(pia, age, fra);
    const annual = monthly * 12;
    const lifetime = lifetimeBenefit(monthly, age);
    const breakeven = age === 62 ? null : breakevenVs62(monthly62, monthly, 62, age);

    return {
      claimAge: age,
      monthlyBenefit: monthly,
      annualBenefit: annual,
      lifetimeBenefit: lifetime,
      breakevenAge: breakeven,
    };
  });

  // Optimal age = highest lifetime benefit (to 90)
  const optimalScenario = scenarios.reduce((best, s) =>
    s.lifetimeBenefit > best.lifetimeBenefit ? s : best
  );

  // Spousal benefit
  let spouseBenefit: number | null = null;
  let totalHouseholdAt70: number | null = null;
  if (spouseMonthlyEarnings !== undefined && spouseAge !== undefined) {
    const spousePia = estimatePIA(spouseMonthlyEarnings);
    const spouseFra = params.spouseFra ?? 67;
    const spouseBenefitOwn = monthlyBenefitAtAge(spousePia, 70, spouseFra);
    const spousalHalf = pia * 0.5; // 50% of primary's PIA at FRA
    spouseBenefit = Math.max(spouseBenefitOwn, spousalHalf);
    totalHouseholdAt70 = monthlyBenefitAtAge(pia, 70, fra) + spouseBenefit;
  }

  return {
    pia,
    scenarios,
    optimalAge: optimalScenario.claimAge,
    monthlyAt62: monthly62,
    monthlyAtFra: monthlyBenefitAtAge(pia, fra, fra),
    monthlyAt70: monthlyBenefitAtAge(pia, 70, fra),
    spouseBenefit,
    totalHouseholdAt70,
  };
}

/**
 * How does Social Security income reduce the required portfolio?
 * SS income reduces annual withdrawals needed from portfolio.
 */
export function ssImpactOnFire(
  monthlySSBenefit: number,
  annualExpenses: number,
  withdrawalRate = 0.04
): {
  reducedAnnualWithdrawal: number;
  reducedFireNumber: number;
  portfolioSavings: number;
} {
  const annualSS = monthlySSBenefit * 12;
  const reducedAnnualWithdrawal = Math.max(0, annualExpenses - annualSS);
  const reducedFireNumber = reducedAnnualWithdrawal / withdrawalRate;
  const fullFireNumber = annualExpenses / withdrawalRate;
  return {
    reducedAnnualWithdrawal,
    reducedFireNumber,
    portfolioSavings: fullFireNumber - reducedFireNumber,
  };
}
