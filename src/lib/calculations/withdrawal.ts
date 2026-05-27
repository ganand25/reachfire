/**
 * Withdrawal strategy simulations for retirement planning
 */

import type { WithdrawalYearlyBalance, BacktestResult } from '@/types/fire';
import { historicalReturns } from '@/lib/data/historicalReturns';

/**
 * Fixed withdrawal rate strategy (e.g., 4% rule)
 */
export function fixedWithdrawal(
  initialPortfolio: number,
  withdrawalRate: number,
  years: number,
  investmentReturn: number,
  inflationRate: number = 0.03
): WithdrawalYearlyBalance[] {
  const balances: WithdrawalYearlyBalance[] = [];
  let portfolio = initialPortfolio;
  const baseWithdrawal = initialPortfolio * withdrawalRate;

  for (let year = 1; year <= years; year++) {
    const startBalance = portfolio;
    const inflationFactor = Math.pow(1 + inflationRate, year - 1);
    const inflationAdjustedWithdrawal = baseWithdrawal * inflationFactor;
    const withdrawal = Math.min(inflationAdjustedWithdrawal, portfolio);

    portfolio -= withdrawal;
    const investReturn = portfolio * investmentReturn;
    portfolio += investReturn;

    balances.push({
      year,
      startBalance,
      withdrawal,
      investmentReturn: investReturn,
      endBalance: Math.max(0, portfolio),
      inflationAdjustedWithdrawal,
    });

    if (portfolio <= 0) break;
  }

  return balances;
}

/**
 * Variable Percentage Withdrawal (VPW) — adjusts withdrawal % based on age/years remaining
 */
export function variablePercentage(
  initialPortfolio: number,
  baseRate: number,
  floorRate: number,
  ceilingRate: number,
  years: number,
  investmentReturn: number
): WithdrawalYearlyBalance[] {
  const balances: WithdrawalYearlyBalance[] = [];
  let portfolio = initialPortfolio;

  for (let year = 1; year <= years; year++) {
    const startBalance = portfolio;
    // Adjust rate based on years remaining (higher rate as portfolio shrinks timeline)
    const yearsRemaining = years - year + 1;
    const vpwRate = Math.min(ceilingRate, Math.max(floorRate, 1 / yearsRemaining));

    const withdrawal = Math.min(portfolio * vpwRate, portfolio);
    portfolio -= withdrawal;
    const investReturn = portfolio * investmentReturn;
    portfolio += investReturn;

    balances.push({
      year,
      startBalance,
      withdrawal,
      investmentReturn: investReturn,
      endBalance: Math.max(0, portfolio),
      inflationAdjustedWithdrawal: withdrawal,
    });

    if (portfolio <= 0) break;
  }

  return balances;
}

/**
 * Guardrails withdrawal strategy
 * Increase withdrawals when portfolio up, cut when down
 */
export function guardrails(
  initialPortfolio: number,
  baseRate: number,
  upperGuardMultiplier: number = 1.2,
  lowerGuardMultiplier: number = 0.8,
  years: number,
  investmentReturn: number
): WithdrawalYearlyBalance[] {
  const balances: WithdrawalYearlyBalance[] = [];
  let portfolio = initialPortfolio;
  let currentWithdrawal = initialPortfolio * baseRate;

  for (let year = 1; year <= years; year++) {
    const startBalance = portfolio;

    // Guardrails adjustment
    const impliedRate = currentWithdrawal / portfolio;
    if (impliedRate > baseRate * (1 / lowerGuardMultiplier)) {
      // Portfolio declined — cut spending
      currentWithdrawal *= lowerGuardMultiplier;
    } else if (impliedRate < baseRate * (1 / upperGuardMultiplier)) {
      // Portfolio grew — can spend more
      currentWithdrawal *= upperGuardMultiplier;
    }

    const withdrawal = Math.min(currentWithdrawal, portfolio);
    portfolio -= withdrawal;
    const investReturn = portfolio * investmentReturn;
    portfolio += investReturn;

    balances.push({
      year,
      startBalance,
      withdrawal,
      investmentReturn: investReturn,
      endBalance: Math.max(0, portfolio),
      inflationAdjustedWithdrawal: withdrawal,
    });

    if (portfolio <= 0) break;
  }

  return balances;
}

/**
 * Historical backtesting using actual Shiller data
 * Tests a specific retirement start year
 */
export function historicalBacktest(
  initialPortfolio: number,
  annualSpending: number,
  startYear: number,
  durationYears: number = 30,
  stockAllocation: number = 0.6 // 60/40 default
): BacktestResult {
  const yearlyBalances: WithdrawalYearlyBalance[] = [];
  let portfolio = initialPortfolio;
  let survived = true;
  let worstYear = startYear;
  let worstYearReturn = 0;

  // Filter available data from startYear
  const dataFromStart = historicalReturns.filter(
    (d) => d.year >= startYear && d.year < startYear + durationYears
  );

  for (let i = 0; i < durationYears; i++) {
    const startBalance = portfolio;
    const inflationAdjSpending = annualSpending * Math.pow(1.03, i);
    const withdrawal = Math.min(inflationAdjSpending, portfolio);

    portfolio -= withdrawal;

    // Get historical return for this year (cycle if data runs out)
    const dataYear = dataFromStart[i % dataFromStart.length];
    const blendedReturn = dataYear
      ? dataYear.stocks * stockAllocation + dataYear.bonds * (1 - stockAllocation)
      : 0.07;

    if (dataYear && blendedReturn < worstYearReturn) {
      worstYearReturn = blendedReturn;
      worstYear = dataYear.year;
    }

    const investReturn = portfolio * blendedReturn;
    portfolio += investReturn;
    portfolio = Math.max(0, portfolio);

    yearlyBalances.push({
      year: startYear + i,
      startBalance,
      withdrawal,
      investmentReturn: investReturn,
      endBalance: portfolio,
      inflationAdjustedWithdrawal: inflationAdjSpending,
    });

    if (portfolio <= 0) {
      survived = false;
      break;
    }
  }

  return {
    startYear,
    endYear: startYear + durationYears,
    survived,
    finalBalance: portfolio,
    worstYear,
    worstYearReturn,
    yearlyBalances,
  };
}

/**
 * Run historical backtesting across all available start years
 */
export function runAllHistoricalBacktests(
  initialPortfolio: number,
  annualSpending: number,
  durationYears: number = 30,
  stockAllocation: number = 0.6
): BacktestResult[] {
  const minYear = 1926;
  const maxStartYear = 2024 - durationYears;
  const results: BacktestResult[] = [];

  for (let year = minYear; year <= maxStartYear; year++) {
    results.push(
      historicalBacktest(initialPortfolio, annualSpending, year, durationYears, stockAllocation)
    );
  }

  return results;
}

/**
 * Calculate historical success rate across all periods
 */
export function historicalSuccessRate(
  initialPortfolio: number,
  annualSpending: number,
  durationYears: number = 30,
  stockAllocation: number = 0.6
): number {
  const results = runAllHistoricalBacktests(
    initialPortfolio,
    annualSpending,
    durationYears,
    stockAllocation
  );
  const survived = results.filter((r) => r.survived).length;
  return (survived / results.length) * 100;
}
