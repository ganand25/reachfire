"use client";

import { useState, useMemo, useCallback } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { FIREInputs, FIREResult } from "@/types/fire";
import {
  fireNumber,
  yearsToFire,
  fireDate,
  projectedGrowth,
  savingsRate,
} from "@/lib/calculations/core";
import { analyzeCoastFire } from "@/lib/calculations/coast";
import { runMonteCarlo } from "@/lib/calculations/montecarlo";
import type { MonteCarloResult } from "@/types/fire";

export const DEFAULT_INPUTS: FIREInputs = {
  currentAge: 30,
  targetRetirementAge: 50,
  annualGrossIncome: 120000,
  annualExpenses: 60000,
  currentPortfolio: 50000,
  monthlySavings: 5000,
  expectedReturnRate: 0.07,
  inflationRate: 0.03,
  withdrawalRate: 0.04,
  taxRate: 0.25,
};

interface UseFireCalculatorReturn {
  inputs: FIREInputs;
  result: FIREResult;
  monteCarloResult: MonteCarloResult | null;
  setInput: <K extends keyof FIREInputs>(key: K, value: FIREInputs[K]) => void;
  runMonteCarloSim: () => void;
  isRunningMonteCarlo: boolean;
  clearInputs: () => void;
}

interface UseFireCalculatorOptions {
  initialInputs?: Partial<FIREInputs>;
  storageKey?: string;
}

export function useFireCalculator(initialInputsOrOptions?: Partial<FIREInputs> | UseFireCalculatorOptions): UseFireCalculatorReturn {
  // Support both legacy (Partial<FIREInputs>) and new options-object signatures
  const opts: UseFireCalculatorOptions =
    initialInputsOrOptions && ("storageKey" in initialInputsOrOptions || "initialInputs" in initialInputsOrOptions)
      ? (initialInputsOrOptions as UseFireCalculatorOptions)
      : { initialInputs: initialInputsOrOptions as Partial<FIREInputs> | undefined };

  const mergedDefaults = useMemo<FIREInputs>(
    () => ({ ...DEFAULT_INPUTS, ...opts.initialInputs }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(opts.initialInputs)]
  );

  // localStorage-backed state (when storageKey provided)
  const [storedInputs, setStoredInputs, clearStoredInputs] = useLocalStorage<FIREInputs>(
    opts.storageKey ?? "__unused__",
    mergedDefaults
  );

  // Plain state (when no storageKey)
  const [plainInputs, setPlainInputs] = useState<FIREInputs>(mergedDefaults);

  const useStorage = Boolean(opts.storageKey);
  const inputs = useStorage ? storedInputs : plainInputs;
  const setInputs = useStorage ? setStoredInputs : setPlainInputs;
  const [monteCarloResult, setMonteCarloResult] = useState<MonteCarloResult | null>(null);
  const [isRunningMonteCarlo, setIsRunningMonteCarlo] = useState(false);

  const setInput = useCallback(<K extends keyof FIREInputs>(key: K, value: FIREInputs[K]) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
    // Reset Monte Carlo when inputs change
    setMonteCarloResult(null);
  }, [setInputs]);

  const clearInputs = useCallback(() => {
    if (useStorage) {
      clearStoredInputs();
    } else {
      setPlainInputs(mergedDefaults);
    }
    setMonteCarloResult(null);
  }, [useStorage, clearStoredInputs, mergedDefaults]);

  const result = useMemo((): FIREResult => {
    const {
      currentAge,
      annualExpenses,
      currentPortfolio,
      monthlySavings,
      expectedReturnRate,
      inflationRate,
      withdrawalRate,
      annualGrossIncome,
    } = inputs;

    const fireNum = fireNumber(annualExpenses, withdrawalRate);
    const leanFireNum = fireNumber(annualExpenses * 0.7, withdrawalRate);
    const fatFireNum = fireNumber(annualExpenses * 1.5, withdrawalRate);
    const years = yearsToFire(currentPortfolio, monthlySavings, expectedReturnRate, fireNum);
    const fireDateVal = fireDate(years);
    const rate = savingsRate(annualGrossIncome, annualExpenses);

    // Projection: show extra 10 years past FIRE
    const projectionYears = Math.min(Math.ceil(years) + 10, 50);
    const projections = projectedGrowth(
      currentPortfolio,
      monthlySavings,
      expectedReturnRate,
      projectionYears,
      inflationRate,
      currentAge
    );

    // Coast FIRE analysis
    const coastAnalysis = analyzeCoastFire(
      currentAge,
      currentPortfolio,
      monthlySavings,
      inputs.targetRetirementAge,
      annualExpenses,
      withdrawalRate,
      expectedReturnRate
    );

    // FIRE type classification based on expenses
    let fireType: FIREResult["fireType"] = "regular_fire";
    if (annualExpenses < 40000) fireType = "lean_fire";
    else if (annualExpenses > 100000) fireType = "fat_fire";
    if (years <= 0) fireType = "coast_fire";

    return {
      fireNumber: fireNum,
      yearsToFire: years,
      fireDate: fireDateVal,
      savingsRate: rate,
      projections,
      fireType,
      leanFireNumber: leanFireNum,
      fatFireNumber: fatFireNum,
      coastFireAge: coastAnalysis.coastAge,
    };
  }, [inputs]);

  const runMonteCarloSim = useCallback(() => {
    setIsRunningMonteCarlo(true);

    // Run in next tick to not block UI
    setTimeout(() => {
      const mcResult = runMonteCarlo(
        {
          currentPortfolio: inputs.currentPortfolio,
          annualContribution: inputs.monthlySavings * 12,
          expectedReturn: inputs.expectedReturnRate,
          stdDeviation: 0.17,
          years: Math.ceil(result.yearsToFire) + 30,
          withdrawalAmount: inputs.annualExpenses,
          startWithdrawingAtYear: Math.ceil(result.yearsToFire),
        },
        1000
      );
      setMonteCarloResult(mcResult);
      setIsRunningMonteCarlo(false);
    }, 0);
  }, [inputs, result.yearsToFire]);

  return {
    inputs,
    result,
    monteCarloResult,
    setInput,
    runMonteCarloSim,
    isRunningMonteCarlo,
    clearInputs,
  };
}
