import type { ScoreWeights } from '../../types/index';

export const ALGORITHM_VERSION = '1.0.0';
export const CATALOGUE_VERSION = '1.0.0';
export const GEMINI_MODEL_ID = 'gemini-2.0-flash';

export const DEFAULT_SCORE_WEIGHTS: ScoreWeights = {
  climate: 30,
  water: 25,
  soil: 20,
  seasonRotation: 15,
  farmerPreference: 10,
};

export const SCORE_WEIGHT_LABELS: Record<keyof ScoreWeights, string> = {
  climate: 'NASA POWER Agroclimate Fit (30%)',
  water: 'Water Balance & Irrigation (25%)',
  soil: 'Soil Matrix & Texture Match (20%)',
  seasonRotation: 'Seasonal Timing & Crop Family Rotation (15%)',
  farmerPreference: 'Harvest Window & Lease Alignment (10%)',
};

export const SRI_LANKA_SEASONS = {
  maha: {
    name: 'Maha Season',
    months: [9, 10, 11, 0, 1, 2], // Oct - Mar (0-indexed: Oct=9, Mar=2)
    description: 'Northeast monsoon period; main agricultural cultivation season with higher nationwide rainfall.',
  },
  yala: {
    name: 'Yala Season',
    months: [3, 4, 5, 6, 7, 8], // Apr - Sep (Apr=3, Sep=8)
    description: 'Southwest monsoon period; inter-monsoon and dry season in dry and intermediate zones.',
  },
} as const;

export function getCurrentSeason(date: Date = new Date()): 'maha' | 'yala' {
  const month = date.getMonth(); // 0 to 11
  // Maha: October (9) to March (2)
  if (month >= 9 || month <= 2) {
    return 'maha';
  }
  // Yala: April (3) to September (8)
  return 'yala';
}

export const HARVEST_WINDOW_MAX_DAYS: Record<string, number> = {
  '<=60': 60,
  '61-90': 90,
  '91-120': 120,
  '>120': 365,
};
