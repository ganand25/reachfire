import { describe, it, expect } from 'vitest';
import { estimatePIA, monthlyBenefitAtAge, analyzeSocialSecurity } from './socialSecurity';

describe('estimatePIA', () => {
  it('low earner ($2K/mo) PIA is between $1K and $2K', () => {
    // $2K/mo: 90% of first $1,174 = $1,056.60 + 32% of ($2K - $1,174) = $264.32 → ~$1,321
    const pia = estimatePIA(2000);
    expect(pia).toBeGreaterThan(1000);
    expect(pia).toBeLessThan(2000);
  });

  it('higher earner gets lower replacement rate', () => {
    const lowPia = estimatePIA(2000);
    const highPia = estimatePIA(8000);
    // PIA shouldn't scale proportionally — SS is progressive
    expect(highPia / 8000).toBeLessThan(lowPia / 2000);
  });

  it('zero earnings → zero PIA', () => {
    expect(estimatePIA(0)).toBe(0);
  });
});

describe('monthlyBenefitAtAge', () => {
  const pia = 2000;
  const fra = 67;

  it('claiming at FRA = PIA', () => {
    expect(monthlyBenefitAtAge(pia, fra, fra)).toBe(pia);
  });

  it('claiming at 70 = PIA * 1.24', () => {
    // 3 years * 8% = 24% increase
    expect(monthlyBenefitAtAge(pia, 70, fra)).toBeCloseTo(pia * 1.24, 0);
  });

  it('claiming at 62 < FRA benefit', () => {
    const early = monthlyBenefitAtAge(pia, 62, fra);
    expect(early).toBeLessThan(pia);
    // Should be roughly 70% of PIA (30% reduction for 5 years early)
    expect(early).toBeGreaterThan(pia * 0.65);
    expect(early).toBeLessThan(pia * 0.75);
  });

  it('later claiming always higher monthly benefit', () => {
    const at62 = monthlyBenefitAtAge(pia, 62, fra);
    const at67 = monthlyBenefitAtAge(pia, 67, fra);
    const at70 = monthlyBenefitAtAge(pia, 70, fra);
    expect(at67).toBeGreaterThan(at62);
    expect(at70).toBeGreaterThan(at67);
  });
});

describe('analyzeSocialSecurity', () => {
  const params = {
    currentAge: 45,
    monthlyEarningsHistory: 6000,
    fra: 67,
  };

  it('returns 9 scenarios (ages 62-70)', () => {
    const result = analyzeSocialSecurity(params);
    expect(result.scenarios).toHaveLength(9);
  });

  it('optimal age is 70 for average life expectancy', () => {
    const result = analyzeSocialSecurity(params);
    // At 90 life expectancy, claiming at 70 is generally optimal
    expect(result.optimalAge).toBe(70);
  });

  it('breakeven vs 62 is null for age 62 itself', () => {
    const result = analyzeSocialSecurity(params);
    const age62 = result.scenarios.find((s) => s.claimAge === 62);
    expect(age62?.breakevenAge).toBeNull();
  });

  it('breakeven age increases with claiming age', () => {
    const result = analyzeSocialSecurity(params);
    const age65 = result.scenarios.find((s) => s.claimAge === 65)?.breakevenAge ?? 0;
    const age70 = result.scenarios.find((s) => s.claimAge === 70)?.breakevenAge ?? 0;
    expect(age70).toBeGreaterThan(age65);
  });
});
