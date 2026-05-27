/**
 * Healthcare cost estimates for FIRE planning
 * Sources: KFF Health Insurance Marketplace Calculator, CMS Medicare data,
 * MEPS (Medical Expenditure Panel Survey) 2024
 */

export interface AgeBand {
  ageMin: number;
  ageMax: number;
  annualPremium: number; // benchmark silver plan, single
  annualOutOfPocket: number; // avg OOP costs
}

/** ACA benchmark silver plan annual premiums by age (2025, pre-subsidy) */
export const acaBenchmarkPremiums: AgeBand[] = [
  { ageMin: 21, ageMax: 29, annualPremium: 4200, annualOutOfPocket: 2800 },
  { ageMin: 30, ageMax: 34, annualPremium: 4740, annualOutOfPocket: 3000 },
  { ageMin: 35, ageMax: 39, annualPremium: 5340, annualOutOfPocket: 3200 },
  { ageMin: 40, ageMax: 44, annualPremium: 6000, annualOutOfPocket: 3400 },
  { ageMin: 45, ageMax: 49, annualPremium: 7200, annualOutOfPocket: 3800 },
  { ageMin: 50, ageMax: 54, annualPremium: 9000, annualOutOfPocket: 4200 },
  { ageMin: 55, ageMax: 59, annualPremium: 11400, annualOutOfPocket: 4800 },
  { ageMin: 60, ageMax: 64, annualPremium: 14400, annualOutOfPocket: 5500 },
];

/** Annual ACA premium adjustment factor for family size */
export const familySizeMultiplier: Record<number, number> = {
  1: 1.0,
  2: 1.95,
  3: 2.55,
  4: 3.15,
  5: 3.75,
};

/** Medicare premium estimates (2025) */
export interface MedicarePremiums {
  partB: number; // annual
  partD: number; // annual avg
  medigap: number; // supplemental, annual avg
  totalEstimate: number;
}

export const medicarePremiums2025: MedicarePremiums = {
  partB: 2076, // $173/mo standard
  partD: 720, // ~$60/mo avg
  medigap: 2400, // ~$200/mo Plan G avg
  totalEstimate: 5196,
};

/** IRMAA surcharges for high-income Medicare enrollees (2025) */
export interface IRMAATier {
  incomeMin: number;
  incomeMax: number | null;
  surchargeAnnual: number;
}

export const irmaaTiers2025: IRMAATier[] = [
  { incomeMin: 0, incomeMax: 106000, surchargeAnnual: 0 },
  { incomeMin: 106000, incomeMax: 133000, surchargeAnnual: 888 },
  { incomeMin: 133000, incomeMax: 167000, surchargeAnnual: 2232 },
  { incomeMin: 167000, incomeMax: 200000, surchargeAnnual: 3564 },
  { incomeMin: 200000, incomeMax: 500000, surchargeAnnual: 4908 },
  { incomeMin: 500000, incomeMax: null, surchargeAnnual: 5532 },
];

/** HSA limits 2025 */
export const hsaLimits2025 = {
  individual: 4300,
  family: 8550,
  catchup: 1000, // age 55+
};

/** Average annual healthcare cost growth rate */
export const HEALTHCARE_INFLATION_RATE = 0.055; // 5.5% historical average

/** Structured ACA benchmark premiums by age band (for healthcare.ts) */
export interface AcaAgeBand {
  minAge: number;
  maxAge: number;
  monthlyPremium: number; // single, benchmark silver plan
}

export interface AcaBenchmarkData {
  ageBands: AcaAgeBand[];
}

export const ACA_BENCHMARK_PREMIUMS: Record<string, AcaBenchmarkData> = {
  national: {
    ageBands: [
      { minAge: 21, maxAge: 29, monthlyPremium: 350 },
      { minAge: 30, maxAge: 34, monthlyPremium: 395 },
      { minAge: 35, maxAge: 39, monthlyPremium: 445 },
      { minAge: 40, maxAge: 44, monthlyPremium: 500 },
      { minAge: 45, maxAge: 49, monthlyPremium: 600 },
      { minAge: 50, maxAge: 54, monthlyPremium: 750 },
      { minAge: 55, maxAge: 59, monthlyPremium: 950 },
      { minAge: 60, maxAge: 64, monthlyPremium: 1200 },
    ],
  },
};

export interface MedicareCostData {
  partB: {
    baseMonthly: number;
    avgSupplementalAnnual: number; // Medigap/Medicare Advantage
  };
  partD: {
    avgMonthlyPremium: number;
  };
}

export const MEDICARE_COSTS: MedicareCostData = {
  partB: {
    baseMonthly: 174.7,
    avgSupplementalAnnual: 2400, // Medigap Plan G average
  },
  partD: {
    avgMonthlyPremium: 55.5,
  },
};
