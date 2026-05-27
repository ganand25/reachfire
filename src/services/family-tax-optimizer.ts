import type {
  FamilyTaxInputs,
  FamilyTaxYearResult,
  FamilyTaxStrategyResult,
} from '@/types/family-tax';
import {
  calculateOrdinaryTax,
  calculateLTCGTax,
  calculateSocialSecurityTaxable,
  getRMD,
  STANDARD_DEDUCTION,
  TAX_BRACKETS,
} from '@/lib/tax-constants';
import { calculateACASubsidy, calculateIRMAA, calculateHeirTax } from '@/lib/aca-constants';

interface Balances {
  trad: number;
  roth: number;
  taxable: number;
  cash: number;
}

function simulateAccumulation(inputs: FamilyTaxInputs): Balances {
  let trad = inputs.traditionalBalance;
  let roth = inputs.rothBalance;
  let taxable = inputs.taxableBalance;
  const cash = inputs.cashBalance;

  for (let age = inputs.currentAge; age < inputs.retirementAge; age++) {
    const override = inputs.contributionOverrides[age];
    trad += override?.traditional ?? inputs.annualTraditionalContribution;
    roth += override?.roth ?? inputs.annualRothContribution;
    taxable += override?.taxable ?? inputs.annualTaxableContribution;

    trad *= 1 + inputs.growthRate;
    roth *= 1 + inputs.growthRate;
    taxable *= 1 + inputs.growthRate;
  }
  return { trad, roth, taxable, cash };
}

function computeYearTaxes(
  ordinaryIncome: number,
  ltcgIncome: number,
  ssIncome: number,
  status: FamilyTaxInputs['filingStatus']
): { federalTax: number; ltcgTax: number } {
  const ssTaxable = calculateSocialSecurityTaxable(ssIncome, ordinaryIncome, status);
  const totalOrdinary = ordinaryIncome + ssTaxable;
  const deduction = STANDARD_DEDUCTION[status];
  const taxableOrdinary = Math.max(0, totalOrdinary - deduction);
  const federalTax = calculateOrdinaryTax(taxableOrdinary, status);
  const ltcgTax = calculateLTCGTax(ltcgIncome, taxableOrdinary, status);
  return { federalTax, ltcgTax };
}

function makeYear(age: number): FamilyTaxYearResult {
  return {
    age,
    traditionalWithdrawal: 0,
    rothWithdrawal: 0,
    taxableWithdrawal: 0,
    cashWithdrawal: 0,
    rothConversion: 0,
    socialSecurityIncome: 0,
    magi: 0,
    federalTax: 0,
    ltcgTax: 0,
    irmaaSurcharge: 0,
    parentTax: 0,
    acaSubsidy: 0,
    traditionalBalance: 0,
    rothBalance: 0,
    taxableBalance: 0,
    cashBalance: 0,
    totalBalance: 0,
    heirTaxIfDeathThisYear: 0,
    rothPercentOfTotal: 0,
  };
}

type StrategyFn = (inputs: FamilyTaxInputs, start: Balances) => FamilyTaxYearResult[];

// Strategy 1: Conventional — Traditional first
const simulateConventional: StrategyFn = (inputs, start) => {
  const years: FamilyTaxYearResult[] = [];
  let { trad, roth, taxable, cash } = start;
  let costBasis = inputs.taxableCostBasisPercent / 100;

  for (let age = inputs.retirementAge; age <= inputs.deathAge; age++) {
    const yr = makeYear(age);
    const yearsFromNow = age - inputs.currentAge;
    const expenses = inputs.annualExpenses * Math.pow(1 + inputs.inflationRate, yearsFromNow);
    const ss = age >= inputs.socialSecurityAge ? inputs.socialSecurityMonthly * 12 : 0;
    yr.socialSecurityIncome = ss;
    let remaining = Math.max(0, expenses - ss);

    const rmd = getRMD(age, trad);
    const tradW = Math.min(trad, Math.max(remaining, rmd));
    trad -= tradW;
    remaining -= tradW;
    yr.traditionalWithdrawal = tradW;

    if (remaining > 0 && taxable > 0) {
      const w = Math.min(taxable, remaining);
      yr.taxableWithdrawal = w;
      yr.ltcgTax = 0; // computed below
      taxable -= w;
      remaining -= w;
    }

    if (remaining > 0 && roth > 0) {
      const w = Math.min(roth, remaining);
      yr.rothWithdrawal = w;
      roth -= w;
      remaining -= w;
    }

    if (remaining > 0 && cash > 0) {
      const w = Math.min(cash, remaining);
      yr.cashWithdrawal = w;
      cash -= w;
      remaining -= w;
    }

    const ltcgIncome = yr.taxableWithdrawal * (1 - costBasis);
    const ordinaryIncome = tradW;
    yr.magi = ordinaryIncome + ltcgIncome + ss * 0.85;

    const taxes = computeYearTaxes(ordinaryIncome, ltcgIncome, ss, inputs.filingStatus);
    yr.federalTax = taxes.federalTax;
    yr.ltcgTax = taxes.ltcgTax;
    yr.irmaaSurcharge = age >= 65 ? calculateIRMAA(yr.magi, inputs.filingStatus) : 0;
    yr.parentTax = taxes.federalTax + taxes.ltcgTax + yr.irmaaSurcharge;
    yr.acaSubsidy = age < 65 ? calculateACASubsidy(yr.magi, age, inputs.householdSize) : 0;

    trad *= 1 + inputs.growthRate;
    roth *= 1 + inputs.growthRate;
    taxable *= 1 + inputs.growthRate;
    if (taxable > 0) costBasis *= 1 / (1 + inputs.growthRate);

    yr.traditionalBalance = trad;
    yr.rothBalance = roth;
    yr.taxableBalance = taxable;
    yr.cashBalance = cash;
    yr.totalBalance = trad + roth + taxable + cash;
    yr.heirTaxIfDeathThisYear = calculateHeirTax(trad, inputs.heirTaxBracket);
    yr.rothPercentOfTotal = yr.totalBalance > 0 ? roth / yr.totalBalance : 0;

    years.push(yr);
  }
  return years;
};

// Strategy 2: Tax-Bracket Optimized (12% fill + Roth conversions)
const simulateTaxOptimized: StrategyFn = (inputs, start) => {
  const years: FamilyTaxYearResult[] = [];
  let { trad, roth, taxable, cash } = start;
  let costBasis = inputs.taxableCostBasisPercent / 100;
  const deduction = STANDARD_DEDUCTION[inputs.filingStatus];
  const brackets = TAX_BRACKETS[inputs.filingStatus];
  const bracket12Top = (brackets[1]?.max ?? 48475) + deduction;

  for (let age = inputs.retirementAge; age <= inputs.deathAge; age++) {
    const yr = makeYear(age);
    const yearsFromNow = age - inputs.currentAge;
    const expenses = inputs.annualExpenses * Math.pow(1 + inputs.inflationRate, yearsFromNow);
    const ss = age >= inputs.socialSecurityAge ? inputs.socialSecurityMonthly * 12 : 0;
    yr.socialSecurityIncome = ss;
    let remaining = Math.max(0, expenses - ss);

    const rmd = getRMD(age, trad);
    const ssTaxable = calculateSocialSecurityTaxable(ss, 0, inputs.filingStatus);
    const tradTarget = Math.max(0, bracket12Top - ssTaxable);
    const tradW = Math.min(trad, Math.max(Math.min(tradTarget, remaining), rmd));
    trad -= tradW;
    remaining -= Math.min(tradW, remaining);
    yr.traditionalWithdrawal = tradW;

    if (remaining > 0 && taxable > 0) {
      const w = Math.min(taxable, remaining);
      yr.taxableWithdrawal = w;
      taxable -= w;
      remaining -= w;
    }

    if (remaining > 0 && roth > 0) {
      const w = Math.min(roth, remaining);
      yr.rothWithdrawal = w;
      roth -= w;
      remaining -= w;
    }

    if (remaining > 0 && cash > 0) {
      const w = Math.min(cash, remaining);
      yr.cashWithdrawal = w;
      cash -= w;
      remaining -= w;
    }

    // Roth conversion in remaining bracket space
    const currentOrdinary = tradW + calculateSocialSecurityTaxable(ss, tradW, inputs.filingStatus);
    const convRoom = Math.max(0, bracket12Top - currentOrdinary);
    if (convRoom > 0 && trad > 0) {
      const conv = Math.min(trad, convRoom);
      trad -= conv;
      roth += conv;
      yr.rothConversion = conv;
    }

    const ordinaryIncome = tradW + yr.rothConversion;
    const ltcgIncome = yr.taxableWithdrawal * (1 - costBasis);
    yr.magi = ordinaryIncome + ltcgIncome + ss * 0.85;

    const taxes = computeYearTaxes(ordinaryIncome, ltcgIncome, ss, inputs.filingStatus);
    yr.federalTax = taxes.federalTax;
    yr.ltcgTax = taxes.ltcgTax;
    yr.irmaaSurcharge = age >= 65 ? calculateIRMAA(yr.magi, inputs.filingStatus) : 0;
    yr.parentTax = taxes.federalTax + taxes.ltcgTax + yr.irmaaSurcharge;
    yr.acaSubsidy = age < 65 ? calculateACASubsidy(yr.magi, age, inputs.householdSize) : 0;

    trad *= 1 + inputs.growthRate;
    roth *= 1 + inputs.growthRate;
    taxable *= 1 + inputs.growthRate;
    if (taxable > 0) costBasis *= 1 / (1 + inputs.growthRate);

    yr.traditionalBalance = trad;
    yr.rothBalance = roth;
    yr.taxableBalance = taxable;
    yr.cashBalance = cash;
    yr.totalBalance = trad + roth + taxable + cash;
    yr.heirTaxIfDeathThisYear = calculateHeirTax(trad, inputs.heirTaxBracket);
    yr.rothPercentOfTotal = yr.totalBalance > 0 ? roth / yr.totalBalance : 0;

    years.push(yr);
  }
  return years;
};

// Strategy 3: Roth Conversion Ladder (aggressive pre-RMD)
const simulateRothLadder: StrategyFn = (inputs, start) => {
  const years: FamilyTaxYearResult[] = [];
  let { trad, roth, taxable, cash } = start;
  let costBasis = inputs.taxableCostBasisPercent / 100;
  const deduction = STANDARD_DEDUCTION[inputs.filingStatus];
  const brackets = TAX_BRACKETS[inputs.filingStatus];
  const bracket12Top = (brackets[1]?.max ?? 48475) + deduction;

  for (let age = inputs.retirementAge; age <= inputs.deathAge; age++) {
    const yr = makeYear(age);
    const yearsFromNow = age - inputs.currentAge;
    const expenses = inputs.annualExpenses * Math.pow(1 + inputs.inflationRate, yearsFromNow);
    const ss = age >= inputs.socialSecurityAge ? inputs.socialSecurityMonthly * 12 : 0;
    yr.socialSecurityIncome = ss;
    let remaining = Math.max(0, expenses - ss);

    const rmd = getRMD(age, trad);
    if (rmd > 0) {
      const tradW = Math.min(trad, Math.max(remaining, rmd));
      trad -= tradW;
      remaining -= Math.min(tradW, remaining);
      yr.traditionalWithdrawal = tradW;
    }

    if (remaining > 0 && taxable > 0) {
      const w = Math.min(taxable, remaining);
      yr.taxableWithdrawal = w;
      taxable -= w;
      remaining -= w;
    }

    if (remaining > 0 && cash > 0) {
      const w = Math.min(cash, remaining);
      yr.cashWithdrawal = w;
      cash -= w;
      remaining -= w;
    }

    if (remaining > 0 && roth > 0 && age >= 60) {
      const w = Math.min(roth, remaining);
      yr.rothWithdrawal = w;
      roth -= w;
      remaining -= w;
    }

    if (remaining > 0 && trad > 0) {
      const tradW = Math.min(trad, remaining);
      trad -= tradW;
      remaining -= tradW;
      yr.traditionalWithdrawal += tradW;
    }

    // Aggressive Roth conversion
    const ssTaxable = calculateSocialSecurityTaxable(
      ss,
      yr.traditionalWithdrawal,
      inputs.filingStatus
    );
    const currentOrd = yr.traditionalWithdrawal + ssTaxable;
    const convRoom = Math.max(0, bracket12Top - currentOrd);
    if (convRoom > 0 && trad > 0) {
      const conv = Math.min(trad, convRoom);
      trad -= conv;
      roth += conv;
      yr.rothConversion = conv;
    }

    const ordinaryIncome = yr.traditionalWithdrawal + yr.rothConversion;
    const ltcgIncome = yr.taxableWithdrawal * (1 - costBasis);
    yr.magi = ordinaryIncome + ltcgIncome + ss * 0.85;

    const taxes = computeYearTaxes(ordinaryIncome, ltcgIncome, ss, inputs.filingStatus);
    yr.federalTax = taxes.federalTax;
    yr.ltcgTax = taxes.ltcgTax;
    yr.irmaaSurcharge = age >= 65 ? calculateIRMAA(yr.magi, inputs.filingStatus) : 0;
    yr.parentTax = taxes.federalTax + taxes.ltcgTax + yr.irmaaSurcharge;
    yr.acaSubsidy = age < 65 ? calculateACASubsidy(yr.magi, age, inputs.householdSize) : 0;

    trad *= 1 + inputs.growthRate;
    roth *= 1 + inputs.growthRate;
    taxable *= 1 + inputs.growthRate;
    if (taxable > 0) costBasis *= 1 / (1 + inputs.growthRate);

    yr.traditionalBalance = trad;
    yr.rothBalance = roth;
    yr.taxableBalance = taxable;
    yr.cashBalance = cash;
    yr.totalBalance = trad + roth + taxable + cash;
    yr.heirTaxIfDeathThisYear = calculateHeirTax(trad, inputs.heirTaxBracket);
    yr.rothPercentOfTotal = yr.totalBalance > 0 ? roth / yr.totalBalance : 0;

    years.push(yr);
  }
  return years;
};

// Strategy 4: Aggressive Roth — fill up to 22% bracket
const simulateAggressiveRoth: StrategyFn = (inputs, start) => {
  const years: FamilyTaxYearResult[] = [];
  let { trad, roth, taxable, cash } = start;
  let costBasis = inputs.taxableCostBasisPercent / 100;
  const deduction = STANDARD_DEDUCTION[inputs.filingStatus];
  const brackets = TAX_BRACKETS[inputs.filingStatus];
  const bracket22Top = (brackets[2]?.max ?? 103350) + deduction;

  for (let age = inputs.retirementAge; age <= inputs.deathAge; age++) {
    const yr = makeYear(age);
    const yearsFromNow = age - inputs.currentAge;
    const expenses = inputs.annualExpenses * Math.pow(1 + inputs.inflationRate, yearsFromNow);
    const ss = age >= inputs.socialSecurityAge ? inputs.socialSecurityMonthly * 12 : 0;
    yr.socialSecurityIncome = ss;
    let remaining = Math.max(0, expenses - ss);

    const rmd = getRMD(age, trad);

    // Spend from taxable + cash first to maximize Roth conversion room
    if (remaining > 0 && taxable > 0) {
      const w = Math.min(taxable, remaining);
      yr.taxableWithdrawal = w;
      taxable -= w;
      remaining -= w;
    }
    if (remaining > 0 && cash > 0) {
      const w = Math.min(cash, remaining);
      yr.cashWithdrawal = w;
      cash -= w;
      remaining -= w;
    }

    // Take RMD or more from Traditional if needed
    if (rmd > 0 || remaining > 0) {
      const tradW = Math.min(trad, Math.max(remaining, rmd));
      trad -= tradW;
      remaining -= Math.min(tradW, remaining);
      yr.traditionalWithdrawal = tradW;
    }

    if (remaining > 0 && roth > 0) {
      const w = Math.min(roth, remaining);
      yr.rothWithdrawal = w;
      roth -= w;
      remaining -= w;
    }

    // Aggressive conversion: fill up to 22% bracket
    const ssTaxable = calculateSocialSecurityTaxable(
      ss,
      yr.traditionalWithdrawal,
      inputs.filingStatus
    );
    const currentOrd = yr.traditionalWithdrawal + ssTaxable;
    const convRoom = Math.max(0, bracket22Top - currentOrd);
    if (convRoom > 0 && trad > 0) {
      const conv = Math.min(trad, convRoom);
      trad -= conv;
      roth += conv;
      yr.rothConversion = conv;
    }

    const ordinaryIncome = yr.traditionalWithdrawal + yr.rothConversion;
    const ltcgIncome = yr.taxableWithdrawal * (1 - costBasis);
    yr.magi = ordinaryIncome + ltcgIncome + ss * 0.85;

    const taxes = computeYearTaxes(ordinaryIncome, ltcgIncome, ss, inputs.filingStatus);
    yr.federalTax = taxes.federalTax;
    yr.ltcgTax = taxes.ltcgTax;
    yr.irmaaSurcharge = age >= 65 ? calculateIRMAA(yr.magi, inputs.filingStatus) : 0;
    yr.parentTax = taxes.federalTax + taxes.ltcgTax + yr.irmaaSurcharge;
    yr.acaSubsidy = age < 65 ? calculateACASubsidy(yr.magi, age, inputs.householdSize) : 0;

    trad *= 1 + inputs.growthRate;
    roth *= 1 + inputs.growthRate;
    taxable *= 1 + inputs.growthRate;
    if (taxable > 0) costBasis *= 1 / (1 + inputs.growthRate);

    yr.traditionalBalance = trad;
    yr.rothBalance = roth;
    yr.taxableBalance = taxable;
    yr.cashBalance = cash;
    yr.totalBalance = trad + roth + taxable + cash;
    yr.heirTaxIfDeathThisYear = calculateHeirTax(trad, inputs.heirTaxBracket);
    yr.rothPercentOfTotal = yr.totalBalance > 0 ? roth / yr.totalBalance : 0;

    years.push(yr);
  }
  return years;
};

// Strategy 5: Max Roth — convert everything as fast as possible (fill 24% bracket)
const simulateMaxRoth: StrategyFn = (inputs, start) => {
  const years: FamilyTaxYearResult[] = [];
  let { trad, roth, taxable, cash } = start;
  let costBasis = inputs.taxableCostBasisPercent / 100;
  const deduction = STANDARD_DEDUCTION[inputs.filingStatus];
  const brackets = TAX_BRACKETS[inputs.filingStatus];
  const bracket24Top = (brackets[3]?.max ?? 197300) + deduction;

  for (let age = inputs.retirementAge; age <= inputs.deathAge; age++) {
    const yr = makeYear(age);
    const yearsFromNow = age - inputs.currentAge;
    const expenses = inputs.annualExpenses * Math.pow(1 + inputs.inflationRate, yearsFromNow);
    const ss = age >= inputs.socialSecurityAge ? inputs.socialSecurityMonthly * 12 : 0;
    yr.socialSecurityIncome = ss;
    let remaining = Math.max(0, expenses - ss);

    const rmd = getRMD(age, trad);

    if (remaining > 0 && taxable > 0) {
      const w = Math.min(taxable, remaining);
      yr.taxableWithdrawal = w;
      taxable -= w;
      remaining -= w;
    }
    if (remaining > 0 && cash > 0) {
      const w = Math.min(cash, remaining);
      yr.cashWithdrawal = w;
      cash -= w;
      remaining -= w;
    }
    if (rmd > 0 || remaining > 0) {
      const tradW = Math.min(trad, Math.max(remaining, rmd));
      trad -= tradW;
      remaining -= Math.min(tradW, remaining);
      yr.traditionalWithdrawal = tradW;
    }
    if (remaining > 0 && roth > 0) {
      const w = Math.min(roth, remaining);
      yr.rothWithdrawal = w;
      roth -= w;
      remaining -= w;
    }

    // Max conversion: fill up to 24% bracket
    const ssTaxable = calculateSocialSecurityTaxable(
      ss,
      yr.traditionalWithdrawal,
      inputs.filingStatus
    );
    const currentOrd = yr.traditionalWithdrawal + ssTaxable;
    const convRoom = Math.max(0, bracket24Top - currentOrd);
    if (convRoom > 0 && trad > 0) {
      const conv = Math.min(trad, convRoom);
      trad -= conv;
      roth += conv;
      yr.rothConversion = conv;
    }

    const ordinaryIncome = yr.traditionalWithdrawal + yr.rothConversion;
    const ltcgIncome = yr.taxableWithdrawal * (1 - costBasis);
    yr.magi = ordinaryIncome + ltcgIncome + ss * 0.85;

    const taxes = computeYearTaxes(ordinaryIncome, ltcgIncome, ss, inputs.filingStatus);
    yr.federalTax = taxes.federalTax;
    yr.ltcgTax = taxes.ltcgTax;
    yr.irmaaSurcharge = age >= 65 ? calculateIRMAA(yr.magi, inputs.filingStatus) : 0;
    yr.parentTax = taxes.federalTax + taxes.ltcgTax + yr.irmaaSurcharge;
    yr.acaSubsidy = age < 65 ? calculateACASubsidy(yr.magi, age, inputs.householdSize) : 0;

    trad *= 1 + inputs.growthRate;
    roth *= 1 + inputs.growthRate;
    taxable *= 1 + inputs.growthRate;
    if (taxable > 0) costBasis *= 1 / (1 + inputs.growthRate);

    yr.traditionalBalance = trad;
    yr.rothBalance = roth;
    yr.taxableBalance = taxable;
    yr.cashBalance = cash;
    yr.totalBalance = trad + roth + taxable + cash;
    yr.heirTaxIfDeathThisYear = calculateHeirTax(trad, inputs.heirTaxBracket);
    yr.rothPercentOfTotal = yr.totalBalance > 0 ? roth / yr.totalBalance : 0;

    years.push(yr);
  }
  return years;
};

function summarize(
  id: string,
  name: string,
  description: string,
  years: FamilyTaxYearResult[],
  heirBracket: number
): FamilyTaxStrategyResult {
  const parentLifetimeTax = years.reduce((s, y) => s + y.parentTax, 0);
  const totalAcaSubsidies = years.reduce((s, y) => s + y.acaSubsidy, 0);
  const lastYear = years[years.length - 1];
  const heirTaxAtDeath = lastYear ? calculateHeirTax(lastYear.traditionalBalance, heirBracket) : 0;
  const totalFamilyTax = parentLifetimeTax + heirTaxAtDeath - totalAcaSubsidies;

  return {
    id,
    name,
    description,
    years,
    parentLifetimeTax,
    totalAcaSubsidies,
    heirTaxAtDeath,
    totalFamilyTax,
    rothPercentToHeirs: lastYear?.rothPercentOfTotal ?? 0,
    balanceAtDeath: lastYear
      ? {
          traditional: lastYear.traditionalBalance,
          roth: lastYear.rothBalance,
          taxable: lastYear.taxableBalance,
          cash: lastYear.cashBalance,
          total: lastYear.totalBalance,
        }
      : { traditional: 0, roth: 0, taxable: 0, cash: 0, total: 0 },
  };
}

export function runFamilyTaxStrategies(inputs: FamilyTaxInputs): FamilyTaxStrategyResult[] {
  const start = simulateAccumulation(inputs);

  const strategies: [string, string, string, StrategyFn][] = [
    [
      'conventional',
      'Conventional',
      'Traditional first. Simple but typically worst for total family tax.',
      simulateConventional,
    ],
    [
      'tax-optimized',
      'Tax-Bracket Optimized',
      'Fill 12% bracket, Roth conversions in remaining space. Balances parent tax vs heir tax.',
      simulateTaxOptimized,
    ],
    [
      'roth-ladder',
      'Roth Conversion Ladder',
      'Live off taxable, convert at 12% bracket. Good balance of ACA subsidies and heir tax.',
      simulateRothLadder,
    ],
    [
      'aggressive-roth',
      'Aggressive Roth (22%)',
      'Convert up to 22% bracket. Higher parent tax, much lower heir tax.',
      simulateAggressiveRoth,
    ],
    [
      'max-roth',
      'Max Roth (24%)',
      'Convert up to 24% bracket. Highest parent tax but minimizes heir tax and maximizes tax-free legacy.',
      simulateMaxRoth,
    ],
  ];

  return strategies.map(([id, name, desc, fn]) =>
    summarize(id, name, desc, fn(inputs, start), inputs.heirTaxBracket)
  );
}
