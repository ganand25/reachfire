/**
 * Debt payoff calculations for FIRE acceleration
 * Avalanche (highest interest first) and Snowball (lowest balance first) strategies
 */

import type { DebtItem, PayoffSchedule, PayoffMonth } from '@/types/fire';
import { compoundImpact } from './decisions';

/**
 * Sort debts for Avalanche strategy (highest interest rate first)
 */
function sortAvalanche(debts: DebtItem[]): DebtItem[] {
  return [...debts].sort((a, b) => b.interestRate - a.interestRate);
}

/**
 * Sort debts for Snowball strategy (lowest balance first)
 */
function sortSnowball(debts: DebtItem[]): DebtItem[] {
  return [...debts].sort((a, b) => a.balance - b.balance);
}

/**
 * Calculate minimum payment needed to eventually pay off the debt
 * (payment must exceed monthly interest)
 */
function effectiveMinPayment(debt: DebtItem): number {
  const monthlyInterest = debt.balance * (debt.interestRate / 12);
  return Math.max(debt.minimumPayment, monthlyInterest + 1);
}

/**
 * Run a payoff simulation with a given debt ordering
 */
function simulatePayoff(
  sortedDebts: DebtItem[],
  strategy: 'avalanche' | 'snowball'
): PayoffSchedule {
  const balances: Record<string, number> = {};
  for (const debt of sortedDebts) {
    balances[debt.id] = debt.balance;
  }

  const totalMinimum = sortedDebts.reduce((sum, d) => sum + effectiveMinPayment(d), 0);
  const monthlyPayment = totalMinimum; // fixed total payment

  const monthlyData: PayoffMonth[] = [];
  let month = 0;
  let totalInterestPaid = 0;
  let debtFreeMonth = 0;

  while (month < 600) {
    // Max 50 years
    month++;
    let availableExtra = monthlyPayment;
    const debtBalances: Record<string, number> = {};

    // Pay minimums on all debts
    for (const debt of sortedDebts) {
      if (balances[debt.id] <= 0) {
        debtBalances[debt.id] = 0;
        continue;
      }

      // Accrue interest
      const interest = balances[debt.id] * (debt.interestRate / 12);
      totalInterestPaid += interest;
      balances[debt.id] += interest;

      // Pay minimum
      const minPay = Math.min(effectiveMinPayment(debt), balances[debt.id]);
      balances[debt.id] -= minPay;
      availableExtra -= minPay;
    }

    // Apply extra payment to focus debt (first in sorted order with remaining balance)
    for (const debt of sortedDebts) {
      if (availableExtra <= 0) break;
      if (balances[debt.id] <= 0) continue;

      const extraPayment = Math.min(availableExtra, balances[debt.id]);
      balances[debt.id] -= extraPayment;
      availableExtra -= extraPayment;
    }

    // Record state
    const totalBalance = Object.values(balances).reduce((sum, b) => sum + Math.max(0, b), 0);
    for (const id of Object.keys(balances)) {
      debtBalances[id] = Math.max(0, balances[id]);
    }

    monthlyData.push({
      month,
      totalBalance: Math.max(0, totalBalance),
      totalInterestPaid,
      debtBalances,
    });

    if (totalBalance <= 0.01) {
      debtFreeMonth = month;
      break;
    }
  }

  const payoffDate = new Date();
  payoffDate.setMonth(payoffDate.getMonth() + (debtFreeMonth || month));

  return {
    strategy,
    months: debtFreeMonth || month,
    totalInterestPaid,
    payoffDate,
    monthlyData,
    debtFreeMonth: debtFreeMonth || month,
  };
}

/**
 * Calculate debt payoff using Avalanche strategy (highest interest first)
 * Minimizes total interest paid
 */
export function avalanchePayoff(debts: DebtItem[]): PayoffSchedule {
  return simulatePayoff(sortAvalanche(debts), 'avalanche');
}

/**
 * Calculate debt payoff using Snowball strategy (lowest balance first)
 * Maximizes psychological wins with quick wins
 */
export function snowballPayoff(debts: DebtItem[]): PayoffSchedule {
  return simulatePayoff(sortSnowball(debts), 'snowball');
}

/**
 * Compare both strategies
 */
export function compareStrategies(debts: DebtItem[]): {
  avalanche: PayoffSchedule;
  snowball: PayoffSchedule;
  interestSavedByAvalanche: number;
  monthsSavedByAvalanche: number;
} {
  const avalanche = avalanchePayoff(debts);
  const snowball = snowballPayoff(debts);

  return {
    avalanche,
    snowball,
    interestSavedByAvalanche: snowball.totalInterestPaid - avalanche.totalInterestPaid,
    monthsSavedByAvalanche: snowball.months - avalanche.months,
  };
}

/**
 * Calculate the investment value of redirected debt payments after payoff
 * @param payoffSchedule - The debt payoff schedule
 * @param annualReturn - Expected investment return rate
 * @param investmentYears - Years to keep investing after debts are paid
 */
export function debtToInvestmentRedirect(
  payoffSchedule: PayoffSchedule,
  allDebts: DebtItem[],
  annualReturn: number,
  investmentYears: number
): {
  monthlyRedirectAmount: number;
  projectedValue: number;
  totalDebtPayments: number;
} {
  const totalMinimum = allDebts.reduce((sum, d) => sum + effectiveMinPayment(d), 0);

  // After debt is paid, redirect all former debt payments to investments
  const monthlyRedirectAmount = totalMinimum;
  const projectedValue = compoundImpact(monthlyRedirectAmount, annualReturn, investmentYears);

  return {
    monthlyRedirectAmount,
    projectedValue,
    totalDebtPayments: totalMinimum * payoffSchedule.months,
  };
}

/**
 * Calculate total debt load
 */
export function totalDebtSummary(debts: DebtItem[]): {
  totalBalance: number;
  totalMinimumPayment: number;
  weightedAverageRate: number;
} {
  const totalBalance = debts.reduce((sum, d) => sum + d.balance, 0);
  const totalMinimumPayment = debts.reduce((sum, d) => sum + d.minimumPayment, 0);
  const weightedRate =
    totalBalance > 0
      ? debts.reduce((sum, d) => sum + d.balance * d.interestRate, 0) / totalBalance
      : 0;

  return {
    totalBalance,
    totalMinimumPayment,
    weightedAverageRate: weightedRate,
  };
}
