import { describe, it, expect } from "vitest";
import { avalanchePayoff, snowballPayoff, compareStrategies } from "./debt";
import type { DebtItem } from "@/types/fire";

const SAMPLE_DEBTS: DebtItem[] = [
  { id: "card", name: "Credit Card", balance: 5000, interestRate: 0.20, minimumPayment: 100 },
  { id: "car", name: "Car Loan", balance: 12000, interestRate: 0.06, minimumPayment: 250 },
  { id: "student", name: "Student Loan", balance: 20000, interestRate: 0.045, minimumPayment: 200 },
];

describe("avalanchePayoff", () => {
  it("produces a valid schedule", () => {
    const schedule = avalanchePayoff(SAMPLE_DEBTS);
    expect(schedule.strategy).toBe("avalanche");
    expect(schedule.months).toBeGreaterThan(0);
    expect(schedule.totalInterestPaid).toBeGreaterThan(0);
    expect(schedule.monthlyData.length).toBeGreaterThan(0);
  });

  it("all debts reach zero balance by the end", () => {
    const schedule = avalanchePayoff(SAMPLE_DEBTS);
    const lastMonth = schedule.monthlyData[schedule.monthlyData.length - 1];
    expect(lastMonth.totalBalance).toBeCloseTo(0, 0);
  });

  it("single debt payoff works", () => {
    const single: DebtItem[] = [
      { id: "a", name: "CC", balance: 1000, interestRate: 0.20, minimumPayment: 50 },
    ];
    const schedule = avalanchePayoff(single);
    expect(schedule.months).toBeGreaterThan(0);
    expect(schedule.totalInterestPaid).toBeGreaterThan(0);
  });
});

describe("snowballPayoff", () => {
  it("produces a valid schedule", () => {
    const schedule = snowballPayoff(SAMPLE_DEBTS);
    expect(schedule.strategy).toBe("snowball");
    expect(schedule.months).toBeGreaterThan(0);
  });

  it("all debts reach zero", () => {
    const schedule = snowballPayoff(SAMPLE_DEBTS);
    const lastMonth = schedule.monthlyData[schedule.monthlyData.length - 1];
    expect(lastMonth.totalBalance).toBeCloseTo(0, 0);
  });
});

describe("compareStrategies", () => {
  it("avalanche saves more interest than snowball (high-rate debt first)", () => {
    const { avalanche, snowball, interestSavedByAvalanche } = compareStrategies(SAMPLE_DEBTS);
    expect(avalanche.totalInterestPaid).toBeLessThanOrEqual(snowball.totalInterestPaid);
    expect(interestSavedByAvalanche).toBeGreaterThanOrEqual(0);
  });

  it("returns both strategies and difference metrics", () => {
    const result = compareStrategies(SAMPLE_DEBTS);
    expect(result).toHaveProperty("avalanche");
    expect(result).toHaveProperty("snowball");
    expect(result).toHaveProperty("interestSavedByAvalanche");
    expect(result).toHaveProperty("monthsSavedByAvalanche");
  });
});
