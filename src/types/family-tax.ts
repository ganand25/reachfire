import type { FilingStatus } from "./retirement";

export interface FamilyTaxInputs {
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  deathAge: number;
  filingStatus: FilingStatus;
  householdSize: number;
  traditionalBalance: number;
  rothBalance: number;
  taxableBalance: number;
  cashBalance: number;
  taxableCostBasisPercent: number;
  annualTraditionalContribution: number;
  annualRothContribution: number;
  annualTaxableContribution: number;
  contributionOverrides: Record<number, {
    traditional?: number;
    roth?: number;
    taxable?: number;
  }>;
  annualExpenses: number;
  growthRate: number;
  inflationRate: number;
  socialSecurityMonthly: number;
  socialSecurityAge: number;
  heirTaxBracket: number;
}

export interface FamilyTaxYearResult {
  age: number;
  traditionalWithdrawal: number;
  rothWithdrawal: number;
  taxableWithdrawal: number;
  cashWithdrawal: number;
  rothConversion: number;
  socialSecurityIncome: number;
  magi: number;
  federalTax: number;
  ltcgTax: number;
  irmaaSurcharge: number;
  parentTax: number;
  acaSubsidy: number;
  traditionalBalance: number;
  rothBalance: number;
  taxableBalance: number;
  cashBalance: number;
  totalBalance: number;
  heirTaxIfDeathThisYear: number;
  rothPercentOfTotal: number;
}

export interface FamilyTaxStrategyResult {
  id: string;
  name: string;
  description: string;
  years: FamilyTaxYearResult[];
  parentLifetimeTax: number;
  totalAcaSubsidies: number;
  heirTaxAtDeath: number;
  totalFamilyTax: number;
  rothPercentToHeirs: number;
  balanceAtDeath: {
    traditional: number;
    roth: number;
    taxable: number;
    cash: number;
    total: number;
  };
}
