import type { FilingStatus } from "@/types/retirement";

export interface TaxBracket {
  min: number;
  max: number;
  rate: number;
}

const SINGLE_BRACKETS: TaxBracket[] = [
  { min: 0, max: 11925, rate: 0.10 },
  { min: 11925, max: 48475, rate: 0.12 },
  { min: 48475, max: 103350, rate: 0.22 },
  { min: 103350, max: 197300, rate: 0.24 },
  { min: 197300, max: 250525, rate: 0.32 },
  { min: 250525, max: 626350, rate: 0.35 },
  { min: 626350, max: Infinity, rate: 0.37 },
];

const MARRIED_BRACKETS: TaxBracket[] = [
  { min: 0, max: 23850, rate: 0.10 },
  { min: 23850, max: 96950, rate: 0.12 },
  { min: 96950, max: 206700, rate: 0.22 },
  { min: 206700, max: 394600, rate: 0.24 },
  { min: 394600, max: 501050, rate: 0.32 },
  { min: 501050, max: 751600, rate: 0.35 },
  { min: 751600, max: Infinity, rate: 0.37 },
];

export const TAX_BRACKETS: Record<FilingStatus, TaxBracket[]> = {
  single: SINGLE_BRACKETS,
  married: MARRIED_BRACKETS,
};

export const STANDARD_DEDUCTION: Record<FilingStatus, number> = {
  single: 15700,
  married: 31400,
};

const SINGLE_LTCG_BRACKETS: TaxBracket[] = [
  { min: 0, max: 48350, rate: 0.00 },
  { min: 48350, max: 533400, rate: 0.15 },
  { min: 533400, max: Infinity, rate: 0.20 },
];

const MARRIED_LTCG_BRACKETS: TaxBracket[] = [
  { min: 0, max: 96700, rate: 0.00 },
  { min: 96700, max: 600050, rate: 0.15 },
  { min: 600050, max: Infinity, rate: 0.20 },
];

export const LTCG_BRACKETS: Record<FilingStatus, TaxBracket[]> = {
  single: SINGLE_LTCG_BRACKETS,
  married: MARRIED_LTCG_BRACKETS,
};

// SECURE Act 2.0 Uniform Lifetime Table (age -> distribution period)
export const RMD_TABLE: Record<number, number> = {
  73: 26.5, 74: 25.5, 75: 24.6, 76: 23.7, 77: 22.9, 78: 22.0,
  79: 21.1, 80: 20.2, 81: 19.4, 82: 18.5, 83: 17.7, 84: 16.8,
  85: 16.0, 86: 15.2, 87: 14.4, 88: 13.7, 89: 12.9, 90: 12.2,
  91: 11.5, 92: 10.8, 93: 10.1, 94: 9.5, 95: 8.9, 96: 8.4,
  97: 7.8, 98: 7.3, 99: 6.8, 100: 6.4,
};

export const ANNUAL_GIFT_EXCLUSION = 19000;

export function calculateOrdinaryTax(taxableIncome: number, status: FilingStatus): number {
  const brackets = TAX_BRACKETS[status];
  let tax = 0;
  for (const bracket of brackets) {
    if (taxableIncome <= bracket.min) break;
    const taxableInBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
    tax += taxableInBracket * bracket.rate;
  }
  return tax;
}

export function getMarginalBracket(taxableIncome: number, status: FilingStatus): number {
  const brackets = TAX_BRACKETS[status];
  for (let i = brackets.length - 1; i >= 0; i--) {
    if (taxableIncome > brackets[i].min) return brackets[i].rate;
  }
  return brackets[0].rate;
}

export function calculateLTCGTax(
  ltcgIncome: number,
  ordinaryIncome: number,
  status: FilingStatus
): number {
  const brackets = LTCG_BRACKETS[status];
  const totalIncome = ordinaryIncome + ltcgIncome;
  let tax = 0;
  let remaining = ltcgIncome;

  for (const bracket of brackets) {
    if (remaining <= 0 || totalIncome <= bracket.min) continue;
    const bracketStart = Math.max(bracket.min, ordinaryIncome);
    const bracketEnd = Math.min(totalIncome, bracket.max);
    if (bracketEnd <= bracketStart) continue;
    const taxableInBracket = Math.min(remaining, bracketEnd - bracketStart);
    tax += taxableInBracket * bracket.rate;
    remaining -= taxableInBracket;
  }
  return tax;
}

export function calculateSocialSecurityTaxable(
  ssIncome: number,
  otherIncome: number,
  status: FilingStatus
): number {
  const provisionalIncome = otherIncome + ssIncome * 0.5;
  const thresholds = status === "single"
    ? { low: 25000, high: 34000 }
    : { low: 32000, high: 44000 };

  if (provisionalIncome <= thresholds.low) return 0;
  if (provisionalIncome <= thresholds.high) {
    return Math.min(ssIncome * 0.5, (provisionalIncome - thresholds.low) * 0.5);
  }
  const base = Math.min(ssIncome * 0.5, (thresholds.high - thresholds.low) * 0.5);
  const additional = Math.min(
    ssIncome * 0.85 - base,
    (provisionalIncome - thresholds.high) * 0.85
  );
  return Math.min(base + additional, ssIncome * 0.85);
}

export function getRMD(age: number, traditionalBalance: number): number {
  if (age < 73) return 0;
  const period = RMD_TABLE[age] ?? Math.max(6.4 - (age - 100) * 0.5, 1);
  return traditionalBalance / period;
}

export function getTopOfBracket(bracketRate: number, status: FilingStatus): number {
  const brackets = TAX_BRACKETS[status];
  const bracket = brackets.find((b) => b.rate === bracketRate);
  if (!bracket) return 0;
  return bracket.max + STANDARD_DEDUCTION[status];
}
