/**
 * 2025 Federal Income Tax Brackets
 * Source: IRS Revenue Procedure 2024-40
 */

export type FilingStatus =
  | 'single'
  | 'married_jointly'
  | 'married_separately'
  | 'head_of_household';

export interface TaxBracket {
  min: number;
  max: number | null;
  rate: number;
}

export interface StandardDeduction {
  single: number;
  married_jointly: number;
  married_separately: number;
  head_of_household: number;
}

export const STANDARD_DEDUCTION_2025: StandardDeduction = {
  single: 15000,
  married_jointly: 30000,
  married_separately: 15000,
  head_of_household: 22500,
};

export const TAX_BRACKETS_2025: Record<FilingStatus, TaxBracket[]> = {
  single: [
    { min: 0, max: 11925, rate: 0.1 },
    { min: 11925, max: 48475, rate: 0.12 },
    { min: 48475, max: 103350, rate: 0.22 },
    { min: 103350, max: 197300, rate: 0.24 },
    { min: 197300, max: 250525, rate: 0.32 },
    { min: 250525, max: 626350, rate: 0.35 },
    { min: 626350, max: null, rate: 0.37 },
  ],
  married_jointly: [
    { min: 0, max: 23850, rate: 0.1 },
    { min: 23850, max: 96950, rate: 0.12 },
    { min: 96950, max: 206700, rate: 0.22 },
    { min: 206700, max: 394600, rate: 0.24 },
    { min: 394600, max: 501050, rate: 0.32 },
    { min: 501050, max: 751600, rate: 0.35 },
    { min: 751600, max: null, rate: 0.37 },
  ],
  married_separately: [
    { min: 0, max: 11925, rate: 0.1 },
    { min: 11925, max: 48475, rate: 0.12 },
    { min: 48475, max: 103350, rate: 0.22 },
    { min: 103350, max: 197300, rate: 0.24 },
    { min: 197300, max: 250525, rate: 0.32 },
    { min: 250525, max: 375800, rate: 0.35 },
    { min: 375800, max: null, rate: 0.37 },
  ],
  head_of_household: [
    { min: 0, max: 17000, rate: 0.1 },
    { min: 17000, max: 64850, rate: 0.12 },
    { min: 64850, max: 103350, rate: 0.22 },
    { min: 103350, max: 197300, rate: 0.24 },
    { min: 197300, max: 250500, rate: 0.32 },
    { min: 250500, max: 626350, rate: 0.35 },
    { min: 626350, max: null, rate: 0.37 },
  ],
};

/**
 * 2025 Long-term Capital Gains Tax Brackets
 */
export const CAPITAL_GAINS_BRACKETS_2025: Record<FilingStatus, TaxBracket[]> = {
  single: [
    { min: 0, max: 48350, rate: 0.0 },
    { min: 48350, max: 533400, rate: 0.15 },
    { min: 533400, max: null, rate: 0.2 },
  ],
  married_jointly: [
    { min: 0, max: 96700, rate: 0.0 },
    { min: 96700, max: 600050, rate: 0.15 },
    { min: 600050, max: null, rate: 0.2 },
  ],
  married_separately: [
    { min: 0, max: 48350, rate: 0.0 },
    { min: 48350, max: 300000, rate: 0.15 },
    { min: 300000, max: null, rate: 0.2 },
  ],
  head_of_household: [
    { min: 0, max: 64750, rate: 0.0 },
    { min: 64750, max: 566200, rate: 0.15 },
    { min: 566200, max: null, rate: 0.2 },
  ],
};

/** 2025 HSA contribution limits */
export const HSA_LIMITS_2025 = {
  individual: 4300,
  family: 8550,
  catchup_55_plus: 1000,
};

/** 2025 401k contribution limits */
export const RETIREMENT_LIMITS_2025 = {
  k401_employee: 23500,
  k401_catchup_50_plus: 7500,
  ira: 7000,
  ira_catchup_50_plus: 1000,
};
