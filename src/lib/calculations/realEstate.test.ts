import { describe, it, expect } from 'vitest';
import { monthlyMortgagePayment, analyzeProperty } from './realEstate';
import type { RentalProperty } from './realEstate';

const SAMPLE_PROPERTY: RentalProperty = {
  id: 'test',
  name: 'Test Property',
  purchasePrice: 300000,
  downPaymentPct: 0.2,
  interestRate: 0.065,
  loanTermYears: 30,
  monthlyRent: 2000,
  monthlyExpenses: 500,
  annualAppreciation: 0.03,
};

describe('monthlyMortgagePayment', () => {
  it('$240K loan at 6.5% for 30 years → ~$1,517/mo', () => {
    const payment = monthlyMortgagePayment(240000, 0.065, 30);
    expect(payment).toBeCloseTo(1517, 0);
  });

  it('higher interest rate → higher payment', () => {
    const low = monthlyMortgagePayment(200000, 0.04, 30);
    const high = monthlyMortgagePayment(200000, 0.07, 30);
    expect(high).toBeGreaterThan(low);
  });

  it('shorter term → higher payment', () => {
    const thirtyYr = monthlyMortgagePayment(200000, 0.06, 30);
    const fifteenYr = monthlyMortgagePayment(200000, 0.06, 15);
    expect(fifteenYr).toBeGreaterThan(thirtyYr);
  });

  it('zero interest rate divides evenly', () => {
    const payment = monthlyMortgagePayment(120000, 0, 10);
    expect(payment).toBeCloseTo(1000, 0);
  });
});

describe('analyzeProperty', () => {
  it('calculates down payment correctly', () => {
    const metrics = analyzeProperty(SAMPLE_PROPERTY);
    expect(metrics.downPayment).toBe(60000);
  });

  it('loan amount = price - down payment', () => {
    const metrics = analyzeProperty(SAMPLE_PROPERTY);
    expect(metrics.loanAmount).toBe(240000);
  });

  it('cap rate is NOI / price', () => {
    const metrics = analyzeProperty(SAMPLE_PROPERTY);
    const expectedNOI = (SAMPLE_PROPERTY.monthlyRent - SAMPLE_PROPERTY.monthlyExpenses) * 12;
    const expectedCapRate = expectedNOI / SAMPLE_PROPERTY.purchasePrice;
    expect(metrics.capRate).toBeCloseTo(expectedCapRate, 3);
  });

  it('cash flow = NOI - mortgage', () => {
    const metrics = analyzeProperty(SAMPLE_PROPERTY);
    expect(metrics.monthlyCashFlow).toBe(metrics.monthlyNOI - metrics.monthlyMortgage);
  });

  it('negative cash flow when expenses + mortgage > rent', () => {
    const expensiveProp: RentalProperty = {
      ...SAMPLE_PROPERTY,
      monthlyExpenses: 1800,
    };
    const metrics = analyzeProperty(expensiveProp);
    expect(metrics.monthlyCashFlow).toBeLessThan(0);
  });

  it('gross rent multiplier = price / annual rent', () => {
    const metrics = analyzeProperty(SAMPLE_PROPERTY);
    const expectedGRM = SAMPLE_PROPERTY.purchasePrice / (SAMPLE_PROPERTY.monthlyRent * 12);
    expect(metrics.grossRentMultiplier).toBeCloseTo(expectedGRM, 1);
  });
});
