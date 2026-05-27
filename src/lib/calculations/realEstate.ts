/**
 * Real estate & rental income calculations for FIRE planning
 */

export interface RentalProperty {
  id: string;
  name: string;
  purchasePrice: number;
  downPaymentPct: number; // e.g. 0.20
  interestRate: number; // e.g. 0.065
  loanTermYears: number; // e.g. 30
  monthlyRent: number;
  monthlyExpenses: number; // taxes, insurance, maintenance, vacancy
  annualAppreciation: number; // e.g. 0.03
}

export interface PropertyMetrics {
  // Financing
  downPayment: number;
  loanAmount: number;
  monthlyMortgage: number;
  // Returns
  grossRentMultiplier: number; // purchase price / annual rent
  capRate: number; // NOI / purchase price
  cashOnCashReturn: number; // annual cash flow / down payment
  monthlyNOI: number; // net operating income (before mortgage)
  monthlyCashFlow: number; // NOI - mortgage
  annualCashFlow: number;
  // Yield
  totalROI: number; // (cash flow + equity paydown + appreciation) / down payment
  breakEvenMonths: number; // months to recoup down payment from cash flow
}

export interface RentalFIREProjection {
  year: number;
  portfolioValue: number; // appreciated property value
  equity: number;
  annualRentalIncome: number;
  cumulativeCashFlow: number;
  mortgageBalance: number;
}

/**
 * Monthly mortgage payment (principal + interest)
 */
export function monthlyMortgagePayment(
  principal: number,
  annualRate: number,
  termYears: number
): number {
  if (annualRate === 0) return principal / (termYears * 12);
  const r = annualRate / 12;
  const n = termYears * 12;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

/**
 * Remaining mortgage balance after `monthsPaid` payments
 */
function remainingBalance(
  principal: number,
  annualRate: number,
  termYears: number,
  monthsPaid: number
): number {
  if (annualRate === 0) return principal - (principal / (termYears * 12)) * monthsPaid;
  const r = annualRate / 12;
  const n = termYears * 12;
  return (
    (principal * (Math.pow(1 + r, n) - Math.pow(1 + r, monthsPaid))) / (Math.pow(1 + r, n) - 1)
  );
}

export function analyzeProperty(prop: RentalProperty): PropertyMetrics {
  const downPayment = prop.purchasePrice * prop.downPaymentPct;
  const loanAmount = prop.purchasePrice - downPayment;
  const monthlyMortgage = monthlyMortgagePayment(loanAmount, prop.interestRate, prop.loanTermYears);

  const monthlyNOI = prop.monthlyRent - prop.monthlyExpenses;
  const monthlyCashFlow = monthlyNOI - monthlyMortgage;
  const annualCashFlow = monthlyCashFlow * 12;

  const capRate = (monthlyNOI * 12) / prop.purchasePrice;
  const cashOnCashReturn = downPayment > 0 ? annualCashFlow / downPayment : 0;
  const grossRentMultiplier =
    prop.monthlyRent > 0 ? prop.purchasePrice / (prop.monthlyRent * 12) : 0;

  // Annual equity paydown (year 1 approximation)
  const year1Balance = remainingBalance(loanAmount, prop.interestRate, prop.loanTermYears, 12);
  const annualEquityPaydown = loanAmount - year1Balance;

  // Annual appreciation
  const annualAppreciation = prop.purchasePrice * prop.annualAppreciation;

  // Total ROI = (cash flow + equity paydown + appreciation) / invested capital
  const totalAnnualReturn = annualCashFlow + annualEquityPaydown + annualAppreciation;
  const totalROI = downPayment > 0 ? totalAnnualReturn / downPayment : 0;

  const breakEvenMonths = monthlyCashFlow > 0 ? Math.ceil(downPayment / monthlyCashFlow) : Infinity;

  return {
    downPayment,
    loanAmount,
    monthlyMortgage: Math.round(monthlyMortgage),
    grossRentMultiplier: Math.round(grossRentMultiplier * 10) / 10,
    capRate,
    cashOnCashReturn,
    monthlyNOI: Math.round(monthlyNOI),
    monthlyCashFlow: Math.round(monthlyCashFlow),
    annualCashFlow: Math.round(annualCashFlow),
    totalROI,
    breakEvenMonths: isFinite(breakEvenMonths) ? breakEvenMonths : -1,
  };
}

export function projectRentalFIRE(prop: RentalProperty, years = 30): RentalFIREProjection[] {
  const downPayment = prop.purchasePrice * prop.downPaymentPct;
  const loanAmount = prop.purchasePrice - downPayment;
  const monthlyMortgage = monthlyMortgagePayment(loanAmount, prop.interestRate, prop.loanTermYears);
  const projections: RentalFIREProjection[] = [];
  let cumulativeCashFlow = 0;

  for (let year = 1; year <= years; year++) {
    const portfolioValue = prop.purchasePrice * Math.pow(1 + prop.annualAppreciation, year);
    const monthsPaid = Math.min(year * 12, prop.loanTermYears * 12);
    const mortgageBalance = remainingBalance(
      loanAmount,
      prop.interestRate,
      prop.loanTermYears,
      monthsPaid
    );
    const equity = portfolioValue - Math.max(0, mortgageBalance);

    // Rent grows with appreciation
    const annualRentalIncome =
      prop.monthlyRent * 12 * Math.pow(1 + prop.annualAppreciation * 0.7, year);

    // Cash flow grows as rent increases (mortgage is fixed)
    const yearMonthlyCashFlow = annualRentalIncome / 12 - prop.monthlyExpenses - monthlyMortgage;
    cumulativeCashFlow += Math.max(0, yearMonthlyCashFlow * 12);

    projections.push({
      year,
      portfolioValue: Math.round(portfolioValue),
      equity: Math.round(equity),
      annualRentalIncome: Math.round(annualRentalIncome),
      cumulativeCashFlow: Math.round(cumulativeCashFlow),
      mortgageBalance: Math.round(Math.max(0, mortgageBalance)),
    });
  }

  return projections;
}

/**
 * How much does rental income reduce years to FIRE?
 */
export function rentalImpactOnFIRE(
  monthlyNetRentalIncome: number,
  annualExpenses: number,
  currentPortfolio: number,
  monthlySavings: number,
  portfolioReturnRate: number,
  withdrawalRate = 0.04
): {
  fireNumberWithout: number;
  fireNumberWith: number;
  portfolioSavings: number;
  monthsEarlier: number;
} {
  const annualRental = monthlyNetRentalIncome * 12;
  const reducedExpenses = Math.max(0, annualExpenses - annualRental);

  const fireNumberWithout = annualExpenses / withdrawalRate;
  const fireNumberWith = reducedExpenses / withdrawalRate;
  const portfolioSavings = fireNumberWithout - fireNumberWith;

  // Simple estimate of months saved (based on how much closer to FIRE number)
  const monthlyReturn = portfolioReturnRate / 12;
  function monthsToTarget(target: number): number {
    if (target <= currentPortfolio) return 0;
    if (monthlyReturn === 0) return (target - currentPortfolio) / monthlySavings;
    // FV = PV*(1+r)^n + PMT*((1+r)^n - 1)/r → solve for n
    let months = 0;
    let balance = currentPortfolio;
    while (balance < target && months < 600) {
      balance = balance * (1 + monthlyReturn) + monthlySavings;
      months++;
    }
    return months;
  }

  const monthsWithout = monthsToTarget(fireNumberWithout);
  const monthsWith = monthsToTarget(fireNumberWith);

  return {
    fireNumberWithout,
    fireNumberWith,
    portfolioSavings,
    monthsEarlier: Math.max(0, monthsWithout - monthsWith),
  };
}
