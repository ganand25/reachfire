// 2025 Federal Poverty Level (48 contiguous states)
const FPL_BASE = 15650;
const FPL_PER_PERSON = 5580;

export function getFPL(householdSize: number): number {
  return FPL_BASE + FPL_PER_PERSON * Math.max(0, householdSize - 1);
}

// ACA premium contribution percentages by income as % of FPL (post-ARPA extension)
// Below 150% FPL: 0-2% of income
// 150-200%: 2-4%
// 200-250%: 4-6%
// 250-300%: 6-8.5%
// 300-400%: 8.5%
// Above 400%: no subsidy (cliff)
function getExpectedContributionPercent(fplRatio: number): number {
  if (fplRatio < 1.5) return 0.02 * (fplRatio / 1.5);
  if (fplRatio < 2.0) return 0.02 + 0.02 * ((fplRatio - 1.5) / 0.5);
  if (fplRatio < 2.5) return 0.04 + 0.02 * ((fplRatio - 2.0) / 0.5);
  if (fplRatio < 3.0) return 0.06 + 0.025 * ((fplRatio - 2.5) / 0.5);
  if (fplRatio <= 4.0) return 0.085;
  return 1;
}

// Benchmark silver plan premium (2025 estimate, varies by age/location)
// Using national average: ~$600/mo for single, ~$1200/mo for family
function getBenchmarkPremium(householdSize: number, age: number): number {
  const ageFactor = age < 30 ? 0.8 : age < 40 ? 1.0 : age < 50 ? 1.2 : age < 60 ? 1.5 : 1.7;
  const basePremium = householdSize <= 1 ? 7200 : householdSize <= 2 ? 14400 : 14400 + (householdSize - 2) * 3600;
  return basePremium * ageFactor;
}

export function calculateACASubsidy(
  magi: number,
  age: number,
  householdSize: number
): number {
  if (age >= 65) return 0;
  const fpl = getFPL(householdSize);
  const fplRatio = magi / fpl;
  if (fplRatio > 4.0 || fplRatio < 1.0) return 0;

  const expectedContribution = magi * getExpectedContributionPercent(fplRatio);
  const benchmark = getBenchmarkPremium(householdSize, age);
  return Math.max(0, benchmark - expectedContribution);
}

// IRMAA surcharges for Medicare Part B + Part D (2025)
// Based on MAGI from 2 years prior
export function calculateIRMAA(magi: number, filingStatus: "single" | "married"): number {
  const thresholds = filingStatus === "single"
    ? [103000, 129000, 161000, 193000, 500000]
    : [206000, 258000, 322000, 386000, 750000];

  // Monthly Part B + Part D surcharges per tier
  const surcharges = [0, 2340, 5460, 8568, 11688, 12780];

  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (magi > thresholds[i]) return surcharges[i + 1];
  }
  return 0;
}

// SECURE Act: non-spouse heirs must drain inherited IRA within 10 years
export function calculateHeirTax(
  traditionalBalance: number,
  heirBracket: number
): number {
  return traditionalBalance * heirBracket;
}
