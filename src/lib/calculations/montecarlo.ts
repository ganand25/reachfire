/**
 * Monte Carlo simulation for FIRE planning
 * Uses log-normal distribution for stock returns
 */

import type { MonteCarloParams, MonteCarloResult } from "@/types/fire";
import { STOCK_RETURN_STD_DEV } from "@/lib/data/historicalReturns";

/**
 * Box-Muller transform: generates a standard normal random variable
 */
function standardNormal(): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/**
 * Generate a log-normal return for a year
 * For log-normal: mu = log(1+r) - sigma²/2
 */
function logNormalReturn(
  meanAnnualReturn: number,
  annualStdDev: number
): number {
  const mu = Math.log(1 + meanAnnualReturn) - (annualStdDev * annualStdDev) / 2;
  const sigma = annualStdDev;
  return Math.exp(mu + sigma * standardNormal()) - 1;
}

/**
 * Run a single Monte Carlo simulation path
 */
function runSingleSimulation(
  params: MonteCarloParams,
  stdDev: number
): number[] {
  const {
    currentPortfolio,
    annualContribution,
    expectedReturn,
    years,
    withdrawalAmount = 0,
    startWithdrawingAtYear = years,
  } = params;

  const yearlyValues: number[] = [];
  let portfolio = currentPortfolio;

  for (let year = 1; year <= years; year++) {
    const yearReturn = logNormalReturn(expectedReturn, stdDev);
    portfolio = portfolio * (1 + yearReturn);

    if (year <= startWithdrawingAtYear) {
      portfolio += annualContribution;
    } else if (withdrawalAmount > 0) {
      portfolio -= withdrawalAmount;
    }

    portfolio = Math.max(0, portfolio); // can't go below 0
    yearlyValues.push(portfolio);
  }

  return yearlyValues;
}

/**
 * Calculate percentile from a sorted array
 */
function percentile(sortedValues: number[], p: number): number {
  const idx = (p / 100) * (sortedValues.length - 1);
  const lower = Math.floor(idx);
  const upper = Math.ceil(idx);
  if (lower === upper) return sortedValues[lower];
  const fraction = idx - lower;
  return sortedValues[lower] * (1 - fraction) + sortedValues[upper] * fraction;
}

/**
 * Run Monte Carlo simulation
 * @param params - Simulation parameters
 * @param simulations - Number of simulations to run (default 1000)
 * @param stdDev - Annual standard deviation (default from historical data)
 */
export function runMonteCarlo(
  params: MonteCarloParams,
  simulations: number = 1000,
  stdDev: number = STOCK_RETURN_STD_DEV
): MonteCarloResult {
  const allPaths: number[][] = [];

  for (let i = 0; i < simulations; i++) {
    allPaths.push(runSingleSimulation(params, stdDev));
  }

  // Final values for each simulation
  const finalValues = allPaths.map((path) => path[path.length - 1]);
  const sortedFinals = [...finalValues].sort((a, b) => a - b);

  // Success rate: did the portfolio survive (end > 0)?
  const { withdrawalAmount = 0 } = params;
  const successCount =
    withdrawalAmount > 0
      ? finalValues.filter((v) => v > 0).length
      : finalValues.filter((v) => v > 0).length;
  const successRate = (successCount / simulations) * 100;

  // Percentile bands — take a sample of paths for visualization (max 100 paths)
  const samplePaths = allPaths
    .sort((a, b) => (a[a.length - 1] || 0) - (b[b.length - 1] || 0))
    .filter((_, i) => i % Math.ceil(simulations / 100) === 0)
    .slice(0, 100);

  return {
    successRate,
    medianOutcome: percentile(sortedFinals, 50),
    percentile10: percentile(sortedFinals, 10),
    percentile25: percentile(sortedFinals, 25),
    percentile50: percentile(sortedFinals, 50),
    percentile75: percentile(sortedFinals, 75),
    percentile90: percentile(sortedFinals, 90),
    paths: samplePaths,
    worstCase: sortedFinals[0],
    bestCase: sortedFinals[sortedFinals.length - 1],
  };
}

/**
 * Get descriptive label for a Monte Carlo success rate
 */
export function successRateLabel(rate: number): {
  label: string;
  color: "green" | "amber" | "red";
} {
  if (rate >= 90) return { label: "Excellent", color: "green" };
  if (rate >= 80) return { label: "Good", color: "green" };
  if (rate >= 70) return { label: "Acceptable", color: "amber" };
  if (rate >= 60) return { label: "Risky", color: "amber" };
  return { label: "High Risk", color: "red" };
}
