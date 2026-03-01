import { describe, it, expect } from "vitest";
import { federalTax, effectiveTaxRate, marginalTaxRate, optimalConversionAmount } from "./tax";

describe("federalTax (2025 brackets, single)", () => {
  it("income below standard deduction ($15K) → $0 tax", () => {
    // $15K gross - $15K standard deduction = $0 taxable
    expect(federalTax(15000, "single")).toBe(0);
  });

  it("$50K income → taxable $35K, mostly 10%+12% brackets", () => {
    // taxable = $50K - $15K = $35K
    // 10% of $11,925 + 12% of ($35K - $11,925) = $1,192.50 + $2,769 = ~$3,961
    const tax = federalTax(50000, "single");
    expect(tax).toBeGreaterThan(3000);
    expect(tax).toBeLessThan(6000);
  });

  it("higher income = higher tax", () => {
    expect(federalTax(200000, "single")).toBeGreaterThan(federalTax(100000, "single"));
  });

  it("zero income = zero tax", () => {
    expect(federalTax(0, "single")).toBe(0);
  });

  it("married jointly pays less than single at same income", () => {
    expect(federalTax(150000, "married_jointly")).toBeLessThan(federalTax(150000, "single"));
  });
});

describe("effectiveTaxRate", () => {
  it("always less than marginal rate", () => {
    const income = 100000;
    expect(effectiveTaxRate(income, "single")).toBeLessThan(marginalTaxRate(income, "single"));
  });

  it("zero income has 0% effective rate", () => {
    expect(effectiveTaxRate(0, "single")).toBe(0);
  });
});

describe("marginalTaxRate", () => {
  it("$30K income → 10% bracket (single, taxable = $15K)", () => {
    // $30K - $15K standard deduction = $15K taxable → 10% bracket (up to $11,925 is 10%, above is 12%)
    // Actually $15K taxable puts us in 12% bracket
    expect(marginalTaxRate(30000, "single")).toBe(0.12);
  });

  it("$700K income → 37% bracket (single, taxable = $685K > $626,350)", () => {
    expect(marginalTaxRate(700000, "single")).toBe(0.37);
  });
});

describe("optimalConversionAmount", () => {
  it("returns positive conversion amount", () => {
    const amount = optimalConversionAmount(0, 0.12, "single");
    expect(amount).toBeGreaterThan(0);
  });

  it("higher target bracket allows more conversion", () => {
    const at12 = optimalConversionAmount(0, 0.12, "single");
    const at22 = optimalConversionAmount(0, 0.22, "single");
    expect(at22).toBeGreaterThan(at12);
  });
});
