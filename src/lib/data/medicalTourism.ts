/**
 * Medical Tourism procedure cost comparison
 * Sources: AARP, Medical Tourism Association, International Medical Travel Journal (2024)
 * Prices are approximate averages at accredited facilities
 */

export interface ProcedureCost {
  procedure: string;
  description: string;
  costs: Record<string, number>; // country -> USD cost
  jciCountries: string[]; // countries with JCI-accredited hospitals for this
  notes: string;
}

export const medicalTourismData: ProcedureCost[] = [
  {
    procedure: 'Hip Replacement',
    description: 'Total hip arthroplasty, unilateral, including implant',
    costs: {
      USA: 40000,
      India: 7000,
      Thailand: 12000,
      Mexico: 14000,
      Turkey: 10000,
      'Costa Rica': 18000,
      Germany: 22000,
    },
    jciCountries: ['India', 'Thailand', 'Turkey', 'Mexico', 'Costa Rica', 'Germany'],
    notes: 'Most common surgery abroad. 3–5 day hospital stay typical.',
  },
  {
    procedure: 'Knee Replacement',
    description: 'Total knee arthroplasty, unilateral, including implant',
    costs: {
      USA: 35000,
      India: 6500,
      Thailand: 11000,
      Mexico: 13000,
      Turkey: 9500,
      'Costa Rica': 16500,
      Germany: 20000,
    },
    jciCountries: ['India', 'Thailand', 'Turkey', 'Mexico', 'Costa Rica', 'Germany'],
    notes: 'Recovery 6–12 weeks. Plan extended stay.',
  },
  {
    procedure: 'Dental Implant (per tooth)',
    description: 'Single tooth implant, crown included',
    costs: {
      USA: 4500,
      India: 900,
      Thailand: 1500,
      Mexico: 1800,
      Turkey: 800,
      'Costa Rica': 1600,
      Colombia: 1200,
    },
    jciCountries: ['India', 'Thailand', 'Mexico', 'Colombia'],
    notes: 'Full mouth restoration can save $20K+ vs US prices.',
  },
  {
    procedure: 'LASIK (both eyes)',
    description: 'Laser vision correction, wavefront-guided bilateral',
    costs: {
      USA: 4600,
      India: 800,
      Thailand: 1400,
      Mexico: 2000,
      Turkey: 1200,
      'Costa Rica': 2200,
    },
    jciCountries: ['India', 'Thailand', 'Turkey'],
    notes: 'Technology often equivalent or superior. Same-day procedure.',
  },
  {
    procedure: 'Cardiac Bypass (CABG)',
    description: 'Coronary artery bypass graft, double or triple',
    costs: {
      USA: 130000,
      India: 10000,
      Thailand: 25000,
      Mexico: 30000,
      Turkey: 20000,
      Germany: 45000,
    },
    jciCountries: ['India', 'Thailand', 'Turkey', 'Germany'],
    notes: 'Life-saving procedure with enormous US cost gap. Research thoroughly.',
  },
  {
    procedure: 'Spinal Fusion',
    description: 'Single-level lumbar spinal fusion with instrumentation',
    costs: {
      USA: 80000,
      India: 8000,
      Thailand: 15000,
      Mexico: 18000,
      Turkey: 12000,
      Germany: 25000,
    },
    jciCountries: ['India', 'Thailand', 'Turkey', 'Germany'],
    notes: 'Very high US cost variance. Get multiple US quotes first.',
  },
  {
    procedure: 'Cataract Surgery (both eyes)',
    description: 'Phacoemulsification with premium IOL, bilateral',
    costs: {
      USA: 6000,
      India: 800,
      Thailand: 1600,
      Mexico: 2200,
      Turkey: 1400,
      'Costa Rica': 2400,
    },
    jciCountries: ['India', 'Thailand', 'Mexico'],
    notes: 'Extremely common abroad. Short 1–2 day procedure.',
  },
  {
    procedure: 'IVF (one cycle)',
    description: 'In vitro fertilization, full cycle with medications',
    costs: {
      USA: 22000,
      India: 3500,
      Thailand: 6000,
      Mexico: 7500,
      'Czech Republic': 5000,
      Spain: 7000,
    },
    jciCountries: ['India', 'Thailand', 'Spain'],
    notes: 'EU countries have excellent success rates and regulatory oversight.',
  },
  {
    procedure: 'Cancer Treatment (chemotherapy)',
    description: '6 months standard chemotherapy protocol',
    costs: {
      USA: 150000,
      India: 15000,
      Thailand: 35000,
      Turkey: 25000,
      Germany: 60000,
    },
    jciCountries: ['India', 'Thailand', 'Turkey', 'Germany'],
    notes: 'Research facility accreditation carefully. Bring all records.',
  },
  {
    procedure: 'Hair Transplant (FUE 3000 grafts)',
    description: 'Follicular unit extraction, 3000 grafts',
    costs: {
      USA: 15000,
      India: 2000,
      Thailand: 3500,
      Turkey: 2500,
      Mexico: 4000,
    },
    jciCountries: ['Turkey', 'India'],
    notes: 'Turkey is world leader in hair transplant volume and value.',
  },
];

/** Countries with significant JCI (Joint Commission International) accredited hospitals */
export const jciCountries: Record<string, number> = {
  UAE: 33,
  Saudi_Arabia: 31,
  Brazil: 64,
  India: 42,
  Turkey: 22,
  Thailand: 67,
  Germany: 18,
  Singapore: 27,
  Mexico: 12,
  'Costa Rica': 5,
  Colombia: 8,
  Malaysia: 16,
  'South Korea': 15,
};

/** Structured procedure cost data for healthcare.ts calculations */
export interface ProcedureCostData {
  id: string;
  name: string;
  usCost: number;
  international: Array<{ countryId: string; cost: number }>;
}

export const PROCEDURE_COSTS: ProcedureCostData[] = medicalTourismData.map((p) => ({
  id: p.procedure.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  name: p.procedure,
  usCost: p.costs['USA'] ?? 0,
  international: Object.entries(p.costs)
    .filter(([country]) => country !== 'USA')
    .map(([country, cost]) => ({
      countryId: country.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      cost,
    })),
}));

/** Estimated annual savings from strategic medical tourism (surgery + travel vs US) */
export function estimateTourismSavings(
  procedureUSACost: number,
  procedureAbroadCost: number,
  travelCost: number = 2500
): number {
  return procedureUSACost - procedureAbroadCost - travelCost;
}
