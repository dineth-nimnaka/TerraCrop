import type {
  CropData,
  ClimateData,
  CheckinData,
  StrategyResult,
  CropRecommendation,
} from '../../types/index';
import { evaluateCropSuitability, type ScoringEngineOptions } from './scoringEngine';

export function generateStrategies(
  crops: CropData[],
  climate: ClimateData | null,
  checkin: CheckinData,
  options: ScoringEngineOptions = {},
): StrategyResult[] {
  // Score all crops with current checkin and climate context
  const allRecommendations: CropRecommendation[] = crops.map((crop) =>
    evaluateCropSuitability(crop, climate, checkin, options),
  );

  // ─────────────────────────────────────────────────────────────
  // STRATEGY 1: Current Practice Baseline
  // Rank all viable crops by total suitability score
  // ─────────────────────────────────────────────────────────────
  const baselineRecs: CropRecommendation[] = [...allRecommendations]
    .sort((a, b) => b.score.total - a.score.total)
    .map((rec) => ({
      ...rec,
      strategy: 'current_practice' as const,
      strategyLabel: 'Current Practice Baseline',
    }));

  const strategy1: StrategyResult = {
    strategy: 'current_practice',
    label: 'Current Practice Baseline',
    description:
      'Standard agronomic ranking balancing observed NASA POWER climate patterns, water access, and crop cycle lengths.',
    recommendations: baselineRecs,
  };

  // ─────────────────────────────────────────────────────────────
  // STRATEGY 2: Soil-Building Rotation
  // Only legumes or cover crops with documented evidence
  // ─────────────────────────────────────────────────────────────
  const soilBuildingRecs: CropRecommendation[] = allRecommendations
    .filter(
      (rec) =>
        (rec.crop.isLegume || rec.crop.isCoverCrop) &&
        rec.crop.soilBuildingEvidence !== null &&
        rec.crop.soilBuildingEvidence !== undefined &&
        rec.crop.soilBuildingEvidence.length > 0,
    )
    .sort((a, b) => b.score.total - a.score.total)
    .map((rec) => {
      const cloned = { ...rec };
      cloned.strategy = 'soil_building' as const;
      cloned.strategyLabel = 'Soil-Building Rotation';
      if (cloned.crop.soilBuildingEvidence) {
        cloned.score = {
          ...cloned.score,
          reasons: [
            `Soil Regeneration Evidence: ${cloned.crop.soilBuildingEvidence}`,
            ...cloned.score.reasons,
          ],
        };
      }
      return cloned;
    });

  const strategy2: StrategyResult = {
    strategy: 'soil_building',
    label: 'Soil-Building & Nitrogen-Fixing Rotation',
    description:
      'Focuses exclusively on grain legumes and green manures with peer-reviewed evidence of biological nitrogen fixation and organic soil carbon restoration.',
    recommendations: soilBuildingRecs,
  };

  // ─────────────────────────────────────────────────────────────
  // STRATEGY 3: Constraint-Adapted Best Match
  // Prioritizes crops adapting to farmer bottlenecks
  // ─────────────────────────────────────────────────────────────
  const constraintRecs: CropRecommendation[] = allRecommendations
    .map((rec) => {
      let constraintBonus = 0;
      const constraintReasons: string[] = [];

      // Constraint 1: Rain-fed or unreliable water access -> reward drought tolerance
      if (
        checkin.waterAccess === 'rain_fed' ||
        checkin.waterReliability === 'unreliable'
      ) {
        if (rec.crop.droughtTolerance === 'high') {
          constraintBonus += 15;
          constraintReasons.push('Bonus: High drought resilience cushions against rain dry-spells.');
        } else if (rec.crop.droughtTolerance === 'medium') {
          constraintBonus += 5;
        }
      }

      // Constraint 2: Tight harvest window or leased land nearing end -> reward rapid growth
      if (
        checkin.harvestWindow === '<=60' ||
        checkin.harvestWindow === '61-90'
      ) {
        if ((rec.crop.growthDurationDays ?? 120) <= 80) {
          constraintBonus += 10;
          constraintReasons.push('Bonus: Ultra-short growth cycle minimizes exposure window.');
        }
      }

      // Constraint 3: Avoid same family monoculture risk
      const currentCropLower = (checkin.currentCrop || '').toLowerCase();
      if (!currentCropLower.includes(rec.crop.family.toLowerCase())) {
        constraintBonus += 5;
      }

      const adjustedTotal = Math.min(100, rec.score.total + constraintBonus);

      return {
        ...rec,
        strategy: 'constraint_adapted' as const,
        strategyLabel: 'Constraint-Adapted Match',
        score: {
          ...rec.score,
          total: adjustedTotal,
          reasons: [...constraintReasons, ...rec.score.reasons],
        },
      };
    })
    .sort((a, b) => b.score.total - a.score.total);

  const strategy3: StrategyResult = {
    strategy: 'constraint_adapted',
    label: 'Constraint-Adapted Best Match',
    description:
      'Optimized specifically for your farm’s limiting constraints: water access reliability, lease timeline limits, and pest break requirements.',
    recommendations: constraintRecs,
  };

  return [strategy1, strategy2, strategy3];
}
