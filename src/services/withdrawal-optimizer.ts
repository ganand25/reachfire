import type {
  RetirementInputs,
  YearResult,
  StrategyResult,
  AccumulationYear,
  TaxTip,
} from "@/types/retirement";
import {
  calculateOrdinaryTax,
  calculateLTCGTax,
  calculateSocialSecurityTaxable,
  getMarginalBracket,
  getRMD,
  STANDARD_DEDUCTION,
  TAX_BRACKETS,
  ANNUAL_GIFT_EXCLUSION,
} from "@/lib/tax-constants";

function makeEmptyYear(age: number): YearResult {
  return {
    age,
    traditionalWithdrawal: 0,
    rothWithdrawal: 0,
    taxableWithdrawal: 0,
    rothConversion: 0,
    socialSecurityIncome: 0,
    ordinaryIncome: 0,
    ltcgIncome: 0,
    federalTax: 0,
    ltcgTax: 0,
    totalTax: 0,
    effectiveRate: 0,
    marginalBracket: 0.10,
    netSpending: 0,
    traditionalBalance: 0,
    rothBalance: 0,
    taxableBalance: 0,
    totalBalance: 0,
    rmdRequired: 0,
    inflationAdjustedExpenses: 0,
  };
}

function growBalances(
  trad: number,
  roth: number,
  taxable: number,
  rate: number
): { trad: number; roth: number; taxable: number } {
  return {
    trad: trad * (1 + rate),
    roth: roth * (1 + rate),
    taxable: taxable * (1 + rate),
  };
}

function simulateAccumulation(inputs: RetirementInputs): {
  accumulation: AccumulationYear[];
  trad: number;
  roth: number;
  taxable: number;
} {
  const years: AccumulationYear[] = [];
  let trad = inputs.traditionalBalance;
  let roth = inputs.rothBalance;
  let taxable = inputs.taxableBalance;

  for (let age = inputs.currentAge; age < inputs.retirementAge; age++) {
    const override = inputs.contributionOverrides[age];
    const tradContrib = override?.traditional ?? inputs.annualTraditionalContribution;
    const rothContrib = override?.roth ?? inputs.annualRothContribution;
    const taxableContrib = override?.taxable ?? inputs.annualTaxableContribution;
    const additionalIncome = override?.additionalIncome ?? inputs.annualAdditionalIncome;

    trad += tradContrib;
    roth += rothContrib;
    taxable += taxableContrib + additionalIncome;

    years.push({
      age,
      traditionalBalance: trad,
      rothBalance: roth,
      taxableBalance: taxable,
      totalBalance: trad + roth + taxable,
      traditionalContribution: tradContrib,
      rothContribution: rothContrib,
      taxableContribution: taxableContrib,
      additionalIncome,
    });

    trad *= 1 + inputs.growthRate;
    roth *= 1 + inputs.growthRate;
    taxable *= 1 + inputs.growthRate;
  }

  return { accumulation: years, trad, roth, taxable };
}

function computeTaxes(
  ordinaryIncome: number,
  ltcgIncome: number,
  ssIncome: number,
  status: RetirementInputs["filingStatus"]
): { federalTax: number; ltcgTax: number; totalTax: number } {
  const ssTaxable = calculateSocialSecurityTaxable(ssIncome, ordinaryIncome, status);
  const totalOrdinary = ordinaryIncome + ssTaxable;
  const deduction = STANDARD_DEDUCTION[status];
  const taxableOrdinary = Math.max(0, totalOrdinary - deduction);
  const federalTax = calculateOrdinaryTax(taxableOrdinary, status);
  const ltcgTax = calculateLTCGTax(ltcgIncome, taxableOrdinary, status);
  return { federalTax, ltcgTax, totalTax: federalTax + ltcgTax };
}

interface StartingBalances {
  trad: number;
  roth: number;
  taxable: number;
}

// Strategy 1: Conventional — Traditional first, then Taxable, then Roth
function simulateConventional(inputs: RetirementInputs, start: StartingBalances): YearResult[] {
  const years: YearResult[] = [];
  let trad = start.trad;
  let roth = start.roth;
  let taxable = start.taxable;
  let costBasisRatio = inputs.taxableCostBasisPercent / 100;

  for (let age = inputs.retirementAge; age <= inputs.lifeExpectancy; age++) {
    const yr = makeEmptyYear(age);
    const yearsFromRetirement = age - inputs.retirementAge;
    const expenses = inputs.annualExpenses * Math.pow(1 + inputs.inflationRate, yearsFromRetirement);
    yr.inflationAdjustedExpenses = expenses;

    const ss = age >= inputs.socialSecurityAge ? inputs.socialSecurityMonthly * 12 : 0;
    yr.socialSecurityIncome = ss;

    let remaining = Math.max(0, expenses - ss);

    const rmd = getRMD(age, trad);
    yr.rmdRequired = rmd;

    // Withdraw from Traditional first
    const tradWithdrawal = Math.min(trad, Math.max(remaining, rmd));
    trad -= tradWithdrawal;
    remaining -= tradWithdrawal;
    yr.traditionalWithdrawal = tradWithdrawal;
    yr.ordinaryIncome = tradWithdrawal;

    // Then Taxable
    if (remaining > 0 && taxable > 0) {
      const taxableW = Math.min(taxable, remaining);
      const gainsRatio = 1 - costBasisRatio;
      yr.ltcgIncome = taxableW * gainsRatio;
      taxable -= taxableW;
      remaining -= taxableW;
      yr.taxableWithdrawal = taxableW;
    }

    // Then Roth
    if (remaining > 0 && roth > 0) {
      const rothW = Math.min(roth, remaining);
      roth -= rothW;
      remaining -= rothW;
      yr.rothWithdrawal = rothW;
    }

    const taxes = computeTaxes(yr.ordinaryIncome, yr.ltcgIncome, ss, inputs.filingStatus);
    yr.federalTax = taxes.federalTax;
    yr.ltcgTax = taxes.ltcgTax;
    yr.totalTax = taxes.totalTax;

    const totalGross = yr.traditionalWithdrawal + yr.taxableWithdrawal + yr.rothWithdrawal + ss;
    yr.effectiveRate = totalGross > 0 ? taxes.totalTax / totalGross : 0;
    yr.marginalBracket = getMarginalBracket(
      Math.max(0, yr.ordinaryIncome - STANDARD_DEDUCTION[inputs.filingStatus]),
      inputs.filingStatus
    );
    yr.netSpending = totalGross - taxes.totalTax;

    const grown = growBalances(trad, roth, taxable, inputs.growthRate);
    trad = grown.trad;
    roth = grown.roth;
    taxable = grown.taxable;
    if (taxable > 0) {
      costBasisRatio = costBasisRatio * (1 / (1 + inputs.growthRate));
    }

    yr.traditionalBalance = trad;
    yr.rothBalance = roth;
    yr.taxableBalance = taxable;
    yr.totalBalance = trad + roth + taxable;

    years.push(yr);
  }
  return years;
}

// Strategy 2: Tax-Bracket Optimized — Fill low brackets from Traditional, use 0% LTCG, Roth conversions
function simulateTaxOptimized(inputs: RetirementInputs, start: StartingBalances): YearResult[] {
  const years: YearResult[] = [];
  let trad = start.trad;
  let roth = start.roth;
  let taxable = start.taxable;
  let costBasisRatio = inputs.taxableCostBasisPercent / 100;
  const brackets = TAX_BRACKETS[inputs.filingStatus];
  const deduction = STANDARD_DEDUCTION[inputs.filingStatus];
  // Target: fill up to top of 12% bracket
  const bracket12Top = (brackets[1]?.max ?? 48475) + deduction;

  for (let age = inputs.retirementAge; age <= inputs.lifeExpectancy; age++) {
    const yr = makeEmptyYear(age);
    const yearsFromRetirement = age - inputs.retirementAge;
    const expenses = inputs.annualExpenses * Math.pow(1 + inputs.inflationRate, yearsFromRetirement);
    yr.inflationAdjustedExpenses = expenses;

    const ss = age >= inputs.socialSecurityAge ? inputs.socialSecurityMonthly * 12 : 0;
    yr.socialSecurityIncome = ss;

    let remaining = Math.max(0, expenses - ss);

    const rmd = getRMD(age, trad);
    yr.rmdRequired = rmd;

    // Step 1: Calculate how much Traditional to withdraw (fill up to 12% bracket ceiling)
    const ssTaxable = calculateSocialSecurityTaxable(ss, 0, inputs.filingStatus);
    const incomeFloor = ssTaxable;
    const tradTarget = Math.max(0, bracket12Top - incomeFloor);
    const tradWithdrawal = Math.min(trad, Math.max(Math.min(tradTarget, remaining), rmd));
    trad -= tradWithdrawal;
    remaining -= Math.min(tradWithdrawal, remaining);
    yr.traditionalWithdrawal = tradWithdrawal;
    yr.ordinaryIncome = tradWithdrawal;

    // Step 2: Fill remaining from Taxable (benefits from 0% LTCG at low income)
    if (remaining > 0 && taxable > 0) {
      const taxableW = Math.min(taxable, remaining);
      const gainsRatio = 1 - costBasisRatio;
      yr.ltcgIncome = taxableW * gainsRatio;
      taxable -= taxableW;
      remaining -= taxableW;
      yr.taxableWithdrawal = taxableW;
    }

    // Step 3: Use Roth for any remaining (tax-free)
    if (remaining > 0 && roth > 0) {
      const rothW = Math.min(roth, remaining);
      roth -= rothW;
      remaining -= rothW;
      yr.rothWithdrawal = rothW;
    }

    // Step 4: Roth conversion — fill remaining bracket space
    const currentOrdinary = yr.ordinaryIncome + calculateSocialSecurityTaxable(ss, yr.ordinaryIncome, inputs.filingStatus);
    const conversionRoom = Math.max(0, bracket12Top - currentOrdinary);
    if (conversionRoom > 0 && trad > 0) {
      const conversion = Math.min(trad, conversionRoom);
      trad -= conversion;
      roth += conversion;
      yr.rothConversion = conversion;
      yr.ordinaryIncome += conversion;
    }

    const taxes = computeTaxes(yr.ordinaryIncome, yr.ltcgIncome, ss, inputs.filingStatus);
    yr.federalTax = taxes.federalTax;
    yr.ltcgTax = taxes.ltcgTax;
    yr.totalTax = taxes.totalTax;

    const totalGross = yr.traditionalWithdrawal + yr.taxableWithdrawal + yr.rothWithdrawal + ss;
    yr.effectiveRate = totalGross > 0 ? taxes.totalTax / totalGross : 0;
    yr.marginalBracket = getMarginalBracket(
      Math.max(0, yr.ordinaryIncome - deduction),
      inputs.filingStatus
    );
    yr.netSpending = totalGross - taxes.totalTax;

    const grown = growBalances(trad, roth, taxable, inputs.growthRate);
    trad = grown.trad;
    roth = grown.roth;
    taxable = grown.taxable;
    if (taxable > 0) {
      costBasisRatio = costBasisRatio * (1 / (1 + inputs.growthRate));
    }

    yr.traditionalBalance = trad;
    yr.rothBalance = roth;
    yr.taxableBalance = taxable;
    yr.totalBalance = trad + roth + taxable;

    years.push(yr);
  }
  return years;
}

// Strategy 3: Roth Conversion Ladder — Live off Taxable early, aggressively convert Traditional to Roth
function simulateRothLadder(inputs: RetirementInputs, start: StartingBalances): YearResult[] {
  const years: YearResult[] = [];
  let trad = start.trad;
  let roth = start.roth;
  let taxable = start.taxable;
  let costBasisRatio = inputs.taxableCostBasisPercent / 100;
  const deduction = STANDARD_DEDUCTION[inputs.filingStatus];
  const brackets = TAX_BRACKETS[inputs.filingStatus];
  const bracket12Top = (brackets[1]?.max ?? 48475) + deduction;

  for (let age = inputs.retirementAge; age <= inputs.lifeExpectancy; age++) {
    const yr = makeEmptyYear(age);
    const yearsFromRetirement = age - inputs.retirementAge;
    const expenses = inputs.annualExpenses * Math.pow(1 + inputs.inflationRate, yearsFromRetirement);
    yr.inflationAdjustedExpenses = expenses;

    const ss = age >= inputs.socialSecurityAge ? inputs.socialSecurityMonthly * 12 : 0;
    yr.socialSecurityIncome = ss;

    let remaining = Math.max(0, expenses - ss);

    const rmd = getRMD(age, trad);
    yr.rmdRequired = rmd;

    // Before age 59.5: prioritize Taxable, then Roth contributions
    // After 59.5: can access Roth freely
    const canAccessRothEarnings = age >= 60;

    if (rmd > 0) {
      const tradW = Math.min(trad, Math.max(remaining, rmd));
      trad -= tradW;
      remaining -= Math.min(tradW, remaining);
      yr.traditionalWithdrawal = tradW;
      yr.ordinaryIncome = tradW;
    }

    // Prioritize Taxable account for spending (preserve Roth growth)
    if (remaining > 0 && taxable > 0) {
      const taxableW = Math.min(taxable, remaining);
      const gainsRatio = 1 - costBasisRatio;
      yr.ltcgIncome = taxableW * gainsRatio;
      taxable -= taxableW;
      remaining -= taxableW;
      yr.taxableWithdrawal = taxableW;
    }

    // Then Roth if needed
    if (remaining > 0 && roth > 0 && canAccessRothEarnings) {
      const rothW = Math.min(roth, remaining);
      roth -= rothW;
      remaining -= rothW;
      yr.rothWithdrawal = rothW;
    }

    // Then Traditional as last resort
    if (remaining > 0 && trad > 0) {
      const tradW = Math.min(trad, remaining);
      trad -= tradW;
      remaining -= tradW;
      yr.traditionalWithdrawal += tradW;
      yr.ordinaryIncome += tradW;
    }

    // Aggressive Roth conversion: fill up to 12% bracket
    const ssTaxable = calculateSocialSecurityTaxable(ss, yr.ordinaryIncome, inputs.filingStatus);
    const currentOrdinary = yr.ordinaryIncome + ssTaxable;
    const conversionRoom = Math.max(0, bracket12Top - currentOrdinary);
    if (conversionRoom > 0 && trad > 0) {
      const conversion = Math.min(trad, conversionRoom);
      trad -= conversion;
      roth += conversion;
      yr.rothConversion = conversion;
      yr.ordinaryIncome += conversion;
    }

    const taxes = computeTaxes(yr.ordinaryIncome, yr.ltcgIncome, ss, inputs.filingStatus);
    yr.federalTax = taxes.federalTax;
    yr.ltcgTax = taxes.ltcgTax;
    yr.totalTax = taxes.totalTax;

    const totalGross = yr.traditionalWithdrawal + yr.taxableWithdrawal + yr.rothWithdrawal + ss;
    yr.effectiveRate = totalGross > 0 ? taxes.totalTax / totalGross : 0;
    yr.marginalBracket = getMarginalBracket(
      Math.max(0, yr.ordinaryIncome - deduction),
      inputs.filingStatus
    );
    yr.netSpending = totalGross - taxes.totalTax;

    const grown = growBalances(trad, roth, taxable, inputs.growthRate);
    trad = grown.trad;
    roth = grown.roth;
    taxable = grown.taxable;
    if (taxable > 0) {
      costBasisRatio = costBasisRatio * (1 / (1 + inputs.growthRate));
    }

    yr.traditionalBalance = trad;
    yr.rothBalance = roth;
    yr.taxableBalance = taxable;
    yr.totalBalance = trad + roth + taxable;

    years.push(yr);
  }
  return years;
}

// Strategy 4: Proportional — Withdraw from all accounts proportionally
function simulateProportional(inputs: RetirementInputs, start: StartingBalances): YearResult[] {
  const years: YearResult[] = [];
  let trad = start.trad;
  let roth = start.roth;
  let taxable = start.taxable;
  let costBasisRatio = inputs.taxableCostBasisPercent / 100;

  for (let age = inputs.retirementAge; age <= inputs.lifeExpectancy; age++) {
    const yr = makeEmptyYear(age);
    const yearsFromRetirement = age - inputs.retirementAge;
    const expenses = inputs.annualExpenses * Math.pow(1 + inputs.inflationRate, yearsFromRetirement);
    yr.inflationAdjustedExpenses = expenses;

    const ss = age >= inputs.socialSecurityAge ? inputs.socialSecurityMonthly * 12 : 0;
    yr.socialSecurityIncome = ss;

    const remaining = Math.max(0, expenses - ss);

    const rmd = getRMD(age, trad);
    yr.rmdRequired = rmd;

    const total = trad + roth + taxable;

    if (total > 0 && remaining > 0) {
      const tradRatio = trad / total;
      const rothRatio = roth / total;
      const taxableRatio = taxable / total;

      let tradW = Math.min(trad, Math.max(remaining * tradRatio, rmd));
      let rothW = Math.min(roth, remaining * rothRatio);
      let taxableW = Math.min(taxable, remaining * taxableRatio);

      // Ensure RMD is met
      if (tradW < rmd) {
        tradW = Math.min(trad, rmd);
      }

      const actualTotal = tradW + rothW + taxableW;
      if (actualTotal < remaining) {
        const shortfall = remaining - actualTotal;
        if (trad - tradW > 0) tradW = Math.min(trad, tradW + shortfall);
        else if (taxable - taxableW > 0) taxableW = Math.min(taxable, taxableW + shortfall);
        else rothW = Math.min(roth, rothW + shortfall);
      }

      trad -= tradW;
      roth -= rothW;
      taxable -= taxableW;

      yr.traditionalWithdrawal = tradW;
      yr.rothWithdrawal = rothW;
      yr.taxableWithdrawal = taxableW;
      yr.ordinaryIncome = tradW;

      const gainsRatio = 1 - costBasisRatio;
      yr.ltcgIncome = taxableW * gainsRatio;
    }

    const taxes = computeTaxes(yr.ordinaryIncome, yr.ltcgIncome, ss, inputs.filingStatus);
    yr.federalTax = taxes.federalTax;
    yr.ltcgTax = taxes.ltcgTax;
    yr.totalTax = taxes.totalTax;

    const totalGross = yr.traditionalWithdrawal + yr.taxableWithdrawal + yr.rothWithdrawal + ss;
    yr.effectiveRate = totalGross > 0 ? taxes.totalTax / totalGross : 0;
    yr.marginalBracket = getMarginalBracket(
      Math.max(0, yr.ordinaryIncome - STANDARD_DEDUCTION[inputs.filingStatus]),
      inputs.filingStatus
    );
    yr.netSpending = totalGross - taxes.totalTax;

    const grown = growBalances(trad, roth, taxable, inputs.growthRate);
    trad = grown.trad;
    roth = grown.roth;
    taxable = grown.taxable;
    if (taxable > 0) {
      costBasisRatio = costBasisRatio * (1 / (1 + inputs.growthRate));
    }

    yr.traditionalBalance = trad;
    yr.rothBalance = roth;
    yr.taxableBalance = taxable;
    yr.totalBalance = trad + roth + taxable;

    years.push(yr);
  }
  return years;
}

function summarizeStrategy(
  id: string,
  name: string,
  description: string,
  years: YearResult[],
  accumulation: AccumulationYear[],
  balanceAtRetirement: StartingBalances
): StrategyResult {
  const totalTaxes = years.reduce((sum, y) => sum + y.totalTax, 0);
  const totalWithdrawals = years.reduce(
    (sum, y) => sum + y.traditionalWithdrawal + y.taxableWithdrawal + y.rothWithdrawal + y.socialSecurityIncome,
    0
  );
  const lastWithFunds = years.findLast((y) => y.totalBalance > 0);
  return {
    id,
    name,
    description,
    years,
    accumulation,
    balanceAtRetirement: {
      traditional: balanceAtRetirement.trad,
      roth: balanceAtRetirement.roth,
      taxable: balanceAtRetirement.taxable,
      total: balanceAtRetirement.trad + balanceAtRetirement.roth + balanceAtRetirement.taxable,
    },
    totalTaxes,
    totalWithdrawals,
    effectiveLifetimeRate: totalWithdrawals > 0 ? totalTaxes / totalWithdrawals : 0,
    accountsLastUntilAge: lastWithFunds?.age ?? years[years.length - 1]?.age ?? 0,
  };
}

export function runAllStrategies(inputs: RetirementInputs): StrategyResult[] {
  const { accumulation, trad, roth, taxable } = simulateAccumulation(inputs);
  const start: StartingBalances = { trad, roth, taxable };

  return [
    summarizeStrategy(
      "conventional",
      "Conventional",
      "Traditional first, then Taxable, then Roth. Simple but typically highest taxes.",
      simulateConventional(inputs, start),
      accumulation,
      start
    ),
    summarizeStrategy(
      "tax-optimized",
      "Tax-Bracket Optimized",
      "Fill the 12% bracket from Traditional, use 0% LTCG window, Roth conversions in remaining space.",
      simulateTaxOptimized(inputs, start),
      accumulation,
      start
    ),
    summarizeStrategy(
      "roth-ladder",
      "Roth Conversion Ladder",
      "Live off Taxable early, aggressively convert Traditional to Roth at low brackets.",
      simulateRothLadder(inputs, start),
      accumulation,
      start
    ),
    summarizeStrategy(
      "proportional",
      "Proportional",
      "Withdraw proportionally from all accounts each year.",
      simulateProportional(inputs, start),
      accumulation,
      start
    ),
  ];
}

export function generateTaxTips(
  inputs: RetirementInputs,
  strategies: StrategyResult[]
): TaxTip[] {
  const tips: TaxTip[] = [];
  const conventional = strategies.find((s) => s.id === "conventional");
  const optimal = strategies.find((s) => s.id === "tax-optimized");
  const rothLadder = strategies.find((s) => s.id === "roth-ladder");

  if (conventional && optimal) {
    const savings = conventional.totalTaxes - optimal.totalTaxes;
    if (savings > 1000) {
      tips.push({
        title: "Tax-bracket filling saves you money",
        description: `By withdrawing from Traditional only up to the 12% bracket ceiling and using Roth/Taxable for the rest, you save $${Math.round(savings).toLocaleString()} in lifetime taxes vs. the conventional approach.`,
        savings,
        priority: "high",
      });
    }
  }

  if (conventional && rothLadder) {
    const savings = conventional.totalTaxes - rothLadder.totalTaxes;
    if (savings > 1000) {
      tips.push({
        title: "Roth conversions before RMDs",
        description: `Converting Traditional to Roth at the 12% bracket before age 73 avoids forced RMDs at higher rates. Potential savings: $${Math.round(savings).toLocaleString()}.`,
        savings,
        priority: "high",
      });
    }
  }

  const deduction = STANDARD_DEDUCTION[inputs.filingStatus];
  tips.push({
    title: `Your standard deduction shelters $${deduction.toLocaleString()}/yr`,
    description: `The first $${deduction.toLocaleString()} of Traditional withdrawals each year is effectively tax-free thanks to the standard deduction. Always withdraw at least this much from Traditional.`,
    savings: null,
    priority: "medium",
  });

  if (inputs.taxableBalance > 50000) {
    const brackets = TAX_BRACKETS[inputs.filingStatus];
    const bracket12Top = (brackets[1]?.max ?? 48475) + deduction;
    tips.push({
      title: "Harvest gains at the 0% LTCG rate",
      description: `When your total taxable income stays under $${bracket12Top.toLocaleString()}, long-term capital gains are taxed at 0%. Sell appreciated stock in low-income years.`,
      savings: null,
      priority: "medium",
    });
  }

  if (inputs.traditionalBalance > 500000) {
    tips.push({
      title: "RMDs will force taxable income at 73",
      description: `With $${Math.round(inputs.traditionalBalance).toLocaleString()} in Traditional accounts, your first RMD at 73 will be ~$${Math.round(inputs.traditionalBalance * Math.pow(1 + inputs.growthRate, Math.max(0, 73 - inputs.currentAge)) / 26.5).toLocaleString()}. Convert to Roth beforehand to reduce this.`,
      savings: null,
      priority: "high",
    });
  }

  tips.push({
    title: `Gift up to $${ANNUAL_GIFT_EXCLUSION.toLocaleString()}/person/year tax-free`,
    description: `You can gift $${ANNUAL_GIFT_EXCLUSION.toLocaleString()} per recipient annually without gift tax. Married couples can gift $${(ANNUAL_GIFT_EXCLUSION * 2).toLocaleString()} together. This reduces your taxable estate and can shift income to lower-bracket family members.`,
    savings: null,
    priority: "low",
  });

  if (inputs.retirementAge < 65) {
    tips.push({
      title: "ACA subsidies depend on income",
      description: "Before Medicare at 65, keeping taxable income low qualifies you for ACA premium subsidies. Tax-bracket filling + Roth withdrawals help maintain low reported income.",
      savings: null,
      priority: "medium",
    });
  }

  return tips.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });
}

export interface BestStrategyPlan {
  strategyId: string;
  strategyName: string;
  totalTaxes: number;
  totalSavings: number;
  whyBest: string;
  phases: {
    title: string;
    ageRange: string;
    actions: string[];
  }[];
  firstFiveYears: {
    age: number;
    traditionalWithdraw: number;
    rothWithdraw: number;
    taxableWithdraw: number;
    rothConversion: number;
    tax: number;
    bracket: string;
  }[];
  comparisonVsOthers: {
    name: string;
    theirTaxes: number;
    yourSavings: number;
  }[];
}

export function generateBestStrategyPlan(
  inputs: RetirementInputs,
  strategies: StrategyResult[]
): BestStrategyPlan {
  const best = strategies.reduce((a, b) => (a.totalTaxes < b.totalTaxes ? a : b));
  const worst = strategies.reduce((a, b) => (a.totalTaxes > b.totalTaxes ? a : b));
  const deduction = STANDARD_DEDUCTION[inputs.filingStatus];
  const brackets = TAX_BRACKETS[inputs.filingStatus];
  const bracket12Top = (brackets[1]?.max ?? 48475) + deduction;

  const whyReasons: string[] = [];
  if (best.id === "tax-optimized") {
    whyReasons.push(
      "It keeps your Traditional withdrawals within the 12% bracket, avoiding the 22%+ jump.",
      "It harvests long-term capital gains at the 0% rate while your income is low.",
      "It converts excess Traditional to Roth, reducing future RMDs."
    );
  } else if (best.id === "roth-ladder") {
    whyReasons.push(
      "Your large Traditional balance benefits from aggressive early Roth conversions.",
      "Living off taxable first preserves Roth's tax-free growth.",
      "Converting at the 12% bracket now beats paying 22%+ on forced RMDs later."
    );
  } else if (best.id === "proportional") {
    whyReasons.push(
      "With your account mix, spreading withdrawals evenly keeps you in lower brackets.",
      "No single account gets drained too fast, maintaining tax diversification."
    );
  } else {
    whyReasons.push(
      "With your specific balances, the conventional order happens to minimize total taxes.",
      "This is uncommon — most people benefit from bracket-filling strategies."
    );
  }

  const phases: BestStrategyPlan["phases"] = [];

  if (inputs.retirementAge < 60) {
    const earlyYears = best.years.filter((y) => y.age < 60);
    const hasConversions = earlyYears.some((y) => y.rothConversion > 0);
    const avgConversion = hasConversions
      ? earlyYears.reduce((s, y) => s + y.rothConversion, 0) / earlyYears.length
      : 0;
    const actions: string[] = [];

    if (earlyYears.some((y) => y.taxableWithdrawal > 0)) {
      actions.push(`Withdraw living expenses from Taxable brokerage (tax-efficient — only gains are taxed)`);
    }
    if (earlyYears.some((y) => y.traditionalWithdrawal > 0)) {
      actions.push(`Withdraw from Traditional up to ~$${Math.round(bracket12Top).toLocaleString()}/yr (stays in 12% bracket)`);
    }
    if (hasConversions) {
      actions.push(`Convert ~$${Math.round(avgConversion).toLocaleString()}/yr from Traditional to Roth (filling low brackets)`);
    }
    actions.push("Keep Roth untouched — let it grow tax-free");

    phases.push({
      title: "Early Retirement",
      ageRange: `${inputs.retirementAge}–59`,
      actions,
    });
  }

  const midYears = best.years.filter((y) => y.age >= 60 && y.age < 73);
  if (midYears.length > 0) {
    const actions: string[] = [];
    const avgTrad = midYears.reduce((s, y) => s + y.traditionalWithdrawal, 0) / midYears.length;
    const hasConversions = midYears.some((y) => y.rothConversion > 0);

    if (avgTrad > 0) {
      actions.push(`Withdraw ~$${Math.round(avgTrad).toLocaleString()}/yr from Traditional (within 12% bracket)`);
    }
    if (midYears.some((y) => y.taxableWithdrawal > 0)) {
      actions.push("Sell taxable investments at 0% LTCG rate while income is low");
    }
    if (hasConversions) {
      const avgConv = midYears.reduce((s, y) => s + y.rothConversion, 0) / midYears.length;
      actions.push(`Continue Roth conversions (~$${Math.round(avgConv).toLocaleString()}/yr) before RMDs start at 73`);
    }
    if (midYears.some((y) => y.rothWithdrawal > 0)) {
      actions.push("Use Roth as tax-free buffer for spending above the bracket ceiling");
    }

    phases.push({
      title: "Pre-RMD Phase",
      ageRange: `${Math.max(60, inputs.retirementAge)}–72`,
      actions,
    });
  }

  const rmdYears = best.years.filter((y) => y.age >= 73);
  if (rmdYears.length > 0) {
    const actions: string[] = [];
    const avgRmd = rmdYears.reduce((s, y) => s + y.rmdRequired, 0) / rmdYears.length;

    actions.push(`Take Required Minimum Distributions (~$${Math.round(avgRmd).toLocaleString()}/yr average)`);
    if (rmdYears.some((y) => y.rothWithdrawal > 0)) {
      actions.push("Supplement with tax-free Roth withdrawals to avoid bracket creep");
    }
    if (rmdYears.some((y) => y.taxableWithdrawal > 0)) {
      actions.push("Use remaining taxable funds — stepped-up basis at death benefits heirs");
    }
    actions.push("Consider gifting $19K/person/yr to reduce taxable estate");

    phases.push({
      title: "RMD Phase",
      ageRange: "73+",
      actions,
    });
  }

  const firstFiveYears = best.years.slice(0, 5).map((y) => {
    const bracketPct = Math.round(y.marginalBracket * 100);
    return {
      age: y.age,
      traditionalWithdraw: y.traditionalWithdrawal,
      rothWithdraw: y.rothWithdrawal,
      taxableWithdraw: y.taxableWithdrawal,
      rothConversion: y.rothConversion,
      tax: y.totalTax,
      bracket: `${bracketPct}%`,
    };
  });

  const comparisonVsOthers = strategies
    .filter((s) => s.id !== best.id)
    .map((s) => ({
      name: s.name,
      theirTaxes: s.totalTaxes,
      yourSavings: s.totalTaxes - best.totalTaxes,
    }))
    .sort((a, b) => b.yourSavings - a.yourSavings);

  return {
    strategyId: best.id,
    strategyName: best.name,
    totalTaxes: best.totalTaxes,
    totalSavings: worst.totalTaxes - best.totalTaxes,
    whyBest: whyReasons.join(" "),
    phases,
    firstFiveYears,
    comparisonVsOthers,
  };
}
