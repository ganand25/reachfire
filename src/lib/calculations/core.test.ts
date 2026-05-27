import { describe, it, expect } from 'vitest';
import {
  fireNumber,
  yearsToFire,
  savingsRate,
  inflationAdjust,
  realReturnRate,
  yearsToDouble,
} from './core';

describe('fireNumber', () => {
  it('4% rule: $40K expenses → $1M FIRE number', () => {
    expect(fireNumber(40000, 0.04)).toBe(1000000);
  });

  it('3.5% rule gives higher FIRE number', () => {
    expect(fireNumber(40000, 0.035)).toBeCloseTo(1142857, 0);
  });

  it('scales linearly with expenses', () => {
    expect(fireNumber(80000, 0.04)).toBe(2000000);
  });
});

describe('yearsToFire', () => {
  it('already at FIRE number returns 0', () => {
    expect(yearsToFire(1000000, 1000, 0.07, 1000000)).toBe(0);
  });

  it('no portfolio, no savings, 0 return → Infinity', () => {
    expect(yearsToFire(0, 0, 0, 1000000)).toBe(Infinity);
  });

  it('reasonable scenario: 30 yr old, $50K portfolio, $5K/mo savings at 7%', () => {
    const years = yearsToFire(50000, 5000, 0.07, 1000000);
    // Should be roughly 9-12 years
    expect(years).toBeGreaterThan(8);
    expect(years).toBeLessThan(15);
  });

  it('higher savings rate = fewer years', () => {
    const years10k = yearsToFire(0, 10000, 0.07, 1000000);
    const years5k = yearsToFire(0, 5000, 0.07, 1000000);
    expect(years10k).toBeLessThan(years5k);
  });
});

describe('savingsRate', () => {
  it('$120K income, $60K expenses → 50% savings rate', () => {
    expect(savingsRate(120000, 60000)).toBeCloseTo(50, 1);
  });

  it('income equals expenses → 0% savings rate', () => {
    expect(savingsRate(60000, 60000)).toBe(0);
  });

  it('caps at 0 when expenses exceed income', () => {
    expect(savingsRate(50000, 60000)).toBe(0);
  });
});

describe('inflationAdjust', () => {
  it('$1 today at 3% for 10 years', () => {
    expect(inflationAdjust(1, 0.03, 10)).toBeCloseTo(0.744, 2);
  });

  it('no inflation → value unchanged', () => {
    expect(inflationAdjust(100000, 0, 20)).toBe(100000);
  });
});

describe('realReturnRate', () => {
  it('7% nominal, 3% inflation → ~3.88% real', () => {
    expect(realReturnRate(0.07, 0.03)).toBeCloseTo(0.0388, 3);
  });

  it('same nominal and inflation → ~0% real', () => {
    expect(realReturnRate(0.03, 0.03)).toBeCloseTo(0, 3);
  });
});

describe('yearsToDouble', () => {
  it('rule of 72: 7% → ~10.3 years', () => {
    expect(yearsToDouble(0.07)).toBeCloseTo(10.3, 0);
  });

  it('higher return = fewer years to double', () => {
    expect(yearsToDouble(0.1)).toBeLessThan(yearsToDouble(0.07));
  });
});
