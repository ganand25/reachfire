/**
 * Geoarbitrage calculations
 * Adjust FIRE number and timeline based on cost of living in different cities
 */

import { citiesData, type CityData } from '@/lib/data/costOfLiving';
import type { GeoarbitrageResult } from '@/types/fire';
import { fireNumber, yearsToFire } from './core';

/**
 * Adjust FIRE number based on cost of living index
 * @param baseFireNumber - FIRE number in base city
 * @param baseCostIndex - Cost index of base city (100 = US average)
 * @param targetCostIndex - Cost index of target city
 */
export function adjustedFireNumber(
  baseFireNumber: number,
  baseCostIndex: number,
  targetCostIndex: number
): number {
  if (baseCostIndex <= 0) return baseFireNumber;
  return baseFireNumber * (targetCostIndex / baseCostIndex);
}

/**
 * Calculate geoarbitrage results for all cities relative to a base city
 */
export function geoarbitrageComparison(
  baseCityId: string,
  annualExpenses: number,
  withdrawalRate: number,
  currentPortfolio: number,
  monthlySavings: number,
  annualReturn: number
): GeoarbitrageResult[] {
  const baseCity = citiesData.find((c) => c.id === baseCityId);
  if (!baseCity) return [];

  const baseFire = fireNumber(annualExpenses, withdrawalRate);

  return citiesData
    .filter((city) => city.id !== baseCityId)
    .map((city) => {
      const adjustedFire = adjustedFireNumber(baseFire, baseCity.costIndex, city.costIndex);
      const adjustedExpenses = annualExpenses * (city.costIndex / baseCity.costIndex);
      const adjustedMonthlySavings = monthlySavings + (annualExpenses - adjustedExpenses) / 12;

      const years = yearsToFire(
        currentPortfolio,
        Math.max(0, adjustedMonthlySavings),
        annualReturn,
        adjustedFire
      );

      return {
        cityId: city.id,
        adjustedFireNumber: adjustedFire,
        adjustedAnnualExpenses: adjustedExpenses,
        savings: baseFire - adjustedFire,
        yearsToFire: years,
      };
    })
    .sort((a, b) => a.adjustedFireNumber - b.adjustedFireNumber);
}

/**
 * Get top N cheapest destinations relative to a base city
 */
export function topGeoarbitrageDestinations(
  baseCityId: string,
  annualExpenses: number,
  withdrawalRate: number,
  currentPortfolio: number,
  monthlySavings: number,
  annualReturn: number,
  limit: number = 10
): GeoarbitrageResult[] {
  return geoarbitrageComparison(
    baseCityId,
    annualExpenses,
    withdrawalRate,
    currentPortfolio,
    monthlySavings,
    annualReturn
  ).slice(0, limit);
}

/**
 * Get city data by ID
 */
export function getCityById(cityId: string): CityData | null {
  return citiesData.find((c) => c.id === cityId) ?? null;
}

/**
 * Get all domestic US cities
 */
export function getDomesticCities(): CityData[] {
  return citiesData.filter((c) => c.region === 'domestic');
}

/**
 * Get all international cities
 */
export function getInternationalCities(): CityData[] {
  return citiesData.filter((c) => c.region === 'international');
}

/**
 * Filter cities by criteria
 */
export function filterCities(options: {
  visaFriendly?: boolean;
  englishSpeaking?: boolean;
  maxCostIndex?: number;
  minSafetyIndex?: number;
  region?: 'domestic' | 'international';
}): CityData[] {
  return citiesData.filter((city) => {
    if (options.visaFriendly !== undefined && city.visaFriendly !== options.visaFriendly)
      return false;
    if (options.englishSpeaking !== undefined && city.englishSpeaking !== options.englishSpeaking)
      return false;
    if (options.maxCostIndex !== undefined && city.costIndex > options.maxCostIndex) return false;
    if (options.minSafetyIndex !== undefined && city.safetyIndex < options.minSafetyIndex)
      return false;
    if (options.region !== undefined && city.region !== options.region) return false;
    return true;
  });
}
