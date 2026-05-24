export type FilingStatus = "single" | "married";

export interface RetirementInputs {
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  filingStatus: FilingStatus;
  traditionalBalance: number;
  rothBalance: number;
  taxableBalance: number;
  taxableCostBasisPercent: number;
  annualExpenses: number;
  growthRate: number;
  inflationRate: number;
  socialSecurityMonthly: number;
  socialSecurityAge: number;
}

export interface YearResult {
  age: number;
  traditionalWithdrawal: number;
  rothWithdrawal: number;
  taxableWithdrawal: number;
  rothConversion: number;
  socialSecurityIncome: number;
  ordinaryIncome: number;
  ltcgIncome: number;
  federalTax: number;
  ltcgTax: number;
  totalTax: number;
  effectiveRate: number;
  marginalBracket: number;
  netSpending: number;
  traditionalBalance: number;
  rothBalance: number;
  taxableBalance: number;
  totalBalance: number;
  rmdRequired: number;
  inflationAdjustedExpenses: number;
}

export interface StrategyResult {
  id: string;
  name: string;
  description: string;
  years: YearResult[];
  totalTaxes: number;
  totalWithdrawals: number;
  effectiveLifetimeRate: number;
  accountsLastUntilAge: number;
}

export interface TaxTip {
  title: string;
  description: string;
  savings: number | null;
  priority: "high" | "medium" | "low";
}
