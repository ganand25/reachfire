/**
 * Core TypeScript types for ReachFire calculations
 */

export type WithdrawalStrategy =
  | "four_percent"
  | "three_five_percent"
  | "variable_percentage"
  | "guardrails";

export type FIREType =
  | "lean_fire"
  | "regular_fire"
  | "fat_fire"
  | "coast_fire"
  | "barista_fire";

export type FilingStatus =
  | "single"
  | "married_jointly"
  | "married_separately"
  | "head_of_household";

export interface FIREInputs {
  currentAge: number;
  targetRetirementAge: number;
  annualGrossIncome: number;
  annualExpenses: number;
  currentPortfolio: number;
  monthlySavings: number;
  expectedReturnRate: number; // decimal, e.g. 0.07
  inflationRate: number; // decimal, e.g. 0.03
  withdrawalRate: number; // decimal, e.g. 0.04
  taxRate: number; // decimal, e.g. 0.25
  partnerIncome?: number;
  partnerSavings?: number;
}

export interface YearlyProjection {
  year: number;
  age: number;
  portfolioValue: number;
  contributions: number;
  growthAmount: number;
  inflationAdjusted: number;
}

export interface FIREResult {
  fireNumber: number;
  yearsToFire: number;
  fireDate: Date;
  savingsRate: number;
  projections: YearlyProjection[];
  fireType: FIREType;
  leanFireNumber: number;
  fatFireNumber: number;
  coastFireAge: number | null;
}

export interface MonteCarloParams {
  currentPortfolio: number;
  annualContribution: number;
  expectedReturn: number;
  stdDeviation: number;
  years: number;
  withdrawalAmount?: number; // for decumulation phase
  startWithdrawingAtYear?: number;
}

export interface MonteCarloResult {
  successRate: number;
  medianOutcome: number;
  percentile10: number;
  percentile25: number;
  percentile50: number;
  percentile75: number;
  percentile90: number;
  paths: number[][]; // subset of paths for visualization
  worstCase: number;
  bestCase: number;
}

export interface WithdrawalYearlyBalance {
  year: number;
  startBalance: number;
  withdrawal: number;
  investmentReturn: number;
  endBalance: number;
  inflationAdjustedWithdrawal: number;
}

export interface BacktestResult {
  startYear: number;
  endYear: number;
  survived: boolean;
  finalBalance: number;
  worstYear: number;
  worstYearReturn: number;
  yearlyBalances: WithdrawalYearlyBalance[];
}

export interface RothLadderRung {
  conversionYear: number;
  conversionAge: number;
  conversionAmount: number;
  taxOnConversion: number;
  availableYear: number; // year the rung becomes penalty-free
  availableAge: number;
}

export interface RothLadderPlan {
  rungs: RothLadderRung[];
  bridgeFundRequired: number;
  totalTaxPaid: number;
  totalTaxSaved: number; // vs leaving in traditional
  yearByYear: RothLadderYearlyPlan[];
}

export interface RothLadderYearlyPlan {
  year: number;
  age: number;
  conversionAmount: number;
  taxPaid: number;
  incomeFromTraditional: number;
  incomeFromRoth: number;
  taxBracket: number;
}

export interface CoastFIREResult {
  coastAge: number;
  coastNumber: number; // portfolio value needed to coast
  currentProgress: number; // % toward coast number
  yearsToCoastAge: number;
  projectedRetirementPortfolio: number;
}

export interface DebtItem {
  id: string;
  name: string;
  balance: number;
  interestRate: number; // decimal
  minimumPayment: number;
}

export interface PayoffMonth {
  month: number;
  totalBalance: number;
  totalInterestPaid: number;
  debtBalances: Record<string, number>;
}

export interface PayoffSchedule {
  strategy: "avalanche" | "snowball";
  months: number;
  totalInterestPaid: number;
  payoffDate: Date;
  monthlyData: PayoffMonth[];
  debtFreeMonth: number;
}

export interface GeoarbitrageResult {
  cityId: string;
  adjustedFireNumber: number;
  adjustedAnnualExpenses: number;
  savings: number; // vs base city
  yearsToFire: number; // with adjusted expenses
}

export interface LifestyleDecision {
  id: string;
  label: string;
  description: string;
  monthlySavings: number;
  category: "food" | "transport" | "housing" | "subscriptions" | "income" | "investing";
}

export interface DecisionImpact {
  decision: LifestyleDecision;
  year5Value: number;
  year10Value: number;
  year20Value: number;
  year30Value: number;
  monthsEarlierToFire: number;
}
