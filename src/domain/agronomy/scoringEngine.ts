import type {
  CropData,
  ClimateData,
  CheckinData,
  ScoreWeights,
  ScoreBreakdown,
  CropRecommendation,
} from '../../types/index';
import {
  DEFAULT_SCORE_WEIGHTS,
  getCurrentSeason,
  HARVEST_WINDOW_MAX_DAYS,
} from './constants';

export interface ScoringEngineOptions {
  rainfallAdjustmentPercent?: number; // e.g. -30 to +30
  weights?: ScoreWeights;
  referenceDate?: Date;
}

/**
 * Pure deterministic rules engine for evaluating crop suitability.
 * Zero external network or UI dependencies.
 */
export function evaluateCropSuitability(
  crop: CropData,
  climate: ClimateData | null,
  checkin: CheckinData,
  options: ScoringEngineOptions = {},
): CropRecommendation {
  const {
    rainfallAdjustmentPercent = 0,
    weights = DEFAULT_SCORE_WEIGHTS,
    referenceDate = new Date(),
  } = options;

  const reasons: string[] = [];
  const missingComponents: string[] = [];

  let earnedClimate = 0;
  let maxClimate = weights.climate;

  let earnedWater = 0;
  let maxWater = weights.water;

  let earnedSoil = 0;
  let maxSoil = weights.soil;

  let earnedSeason = 0;
  let maxSeason = weights.seasonRotation;

  let earnedFarmer = 0;
  let maxFarmer = weights.farmerPreference;

  let insufficientData = false;

  // ─────────────────────────────────────────────────────────────
  // 1. CLIMATE COMPONENT (Default 30 pts)
  // ─────────────────────────────────────────────────────────────
  if (!climate || !climate.summary || climate.summary.avgTemp === null) {
    missingComponents.push('Observed temperature data unavailable from NASA POWER');
    maxClimate = 0; // Renormalize out
  } else if (crop.optimalTempMin === null || crop.optimalTempMax === null) {
    missingComponents.push(`Missing temperature tolerance thresholds for ${crop.name}`);
    insufficientData = true;
    maxClimate = 0;
  } else {
    const avgTemp = climate.summary.avgTemp;
    const maxObserved = climate.summary.maxTemp ?? avgTemp;
    const minObserved = climate.summary.minTemp ?? avgTemp;

    if (avgTemp >= crop.optimalTempMin && avgTemp <= crop.optimalTempMax) {
      earnedClimate += weights.climate * 0.7; // 70% of climate weight for mean temp
      reasons.push(
        `Mean temperature (${avgTemp}°C) is within optimal range (${crop.optimalTempMin}–${crop.optimalTempMax}°C).`,
      );
    } else if (
      (crop.minTemp === null || avgTemp >= crop.minTemp) &&
      (crop.maxTemp === null || avgTemp <= crop.maxTemp)
    ) {
      earnedClimate += weights.climate * 0.4;
      reasons.push(
        `Mean temperature (${avgTemp}°C) is acceptable but outside optimal range (${crop.optimalTempMin}–${crop.optimalTempMax}°C).`,
      );
    } else {
      earnedClimate += weights.climate * 0.1;
      reasons.push(
        `Mean temperature (${avgTemp}°C) deviates from thermal limits (${crop.minTemp}–${crop.maxTemp}°C).`,
      );
    }

    // Extremes check (remaining 30% of climate weight)
    if (crop.maxTemp !== null && maxObserved > crop.maxTemp) {
      reasons.push(
        `Observed peak heat (${maxObserved}°C) exceeds heat tolerance (${crop.maxTemp}°C).`,
      );
    } else if (crop.minTemp !== null && minObserved < crop.minTemp) {
      reasons.push(
        `Observed minimum temp (${minObserved}°C) drops below cold tolerance (${crop.minTemp}°C).`,
      );
    } else {
      earnedClimate += weights.climate * 0.3;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 2. WATER COMPONENT (Default 25 pts)
  // ─────────────────────────────────────────────────────────────
  const baseRainfall = climate?.summary?.rainfallTotal ?? null;

  if (crop.waterNeedMmPerCycle === null) {
    missingComponents.push(`Missing baseline water requirement for ${crop.name}`);
    insufficientData = true;
    maxWater = 0;
  } else {
    // Apply what-if scenario slider adjustment
    const adjustedRainfall =
      baseRainfall !== null && baseRainfall > 0
        ? Math.max(0, baseRainfall * (1 + rainfallAdjustmentPercent / 100))
        : null;

    if (checkin.waterAccess === 'rain_fed') {
      if (adjustedRainfall === null) {
        missingComponents.push('Historical rainfall data missing for rain-fed assessment');
        maxWater = 0;
      } else {
        const ratio = adjustedRainfall / crop.waterNeedMmPerCycle;

        if (ratio >= 0.8) {
          earnedWater += weights.water;
          reasons.push(
            `Rain-fed moisture budget (${adjustedRainfall.toFixed(0)} mm with scenario) meets crop demand (~${crop.waterNeedMmPerCycle} mm).`,
          );
        } else if (ratio >= 0.5) {
          if (crop.droughtTolerance === 'high') {
            earnedWater += weights.water * 0.8;
            reasons.push(
              `Rainfall is below standard cycle need, but ${crop.name} has high drought tolerance.`,
            );
          } else {
            earnedWater += weights.water * 0.5;
            reasons.push(
              `Rainfall (${adjustedRainfall.toFixed(0)} mm) covers only ~${(ratio * 100).toFixed(0)}% of crop water demand.`,
            );
          }
        } else {
          if (crop.droughtTolerance === 'high') {
            earnedWater += weights.water * 0.4;
            reasons.push(
              `Deficit scenario (${adjustedRainfall.toFixed(0)} mm), supported partly by high drought resilience.`,
            );
          } else {
            earnedWater += weights.water * 0.1;
            reasons.push(
              `Severe moisture deficit for rain-fed cultivation without supplemental irrigation.`,
            );
          }
        }

        if (rainfallAdjustmentPercent !== 0) {
          reasons.push(
            `Includes ${rainfallAdjustmentPercent > 0 ? '+' : ''}${rainfallAdjustmentPercent}% rainfall what-if scenario.`,
          );
        }
      }
    } else {
      // Canal or well irrigation access
      const reliability = checkin.waterReliability || 'reliable';
      if (reliability === 'reliable') {
        earnedWater += weights.water;
        reasons.push(
          `Reliable irrigation (${checkin.waterAccess}) ensures adequate water supply regardless of dry spells.`,
        );
      } else if (reliability === 'somewhat_reliable') {
        if (crop.waterNeedMmPerCycle > 600) {
          earnedWater += weights.water * 0.65;
          reasons.push(
            `High water requirement crop with intermittent irrigation cuts introduces mid-season risk.`,
          );
        } else {
          earnedWater += weights.water * 0.85;
          reasons.push(
            `Moderate water requirement manageable with somewhat reliable irrigation.`,
          );
        }
      } else {
        // Unreliable irrigation
        if (crop.droughtTolerance === 'high') {
          earnedWater += weights.water * 0.6;
          reasons.push(
            `Unreliable water source; drought-tolerant profile mitigates dry spell shocks.`,
          );
        } else {
          earnedWater += weights.water * 0.3;
          reasons.push(
            `High risk of water stress due to unreliable irrigation supply.`,
          );
        }
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 3. SOIL COMPONENT (Default 20 pts)
  // ─────────────────────────────────────────────────────────────
  let soilPointsAvailable = 0;
  let soilPointsEarned = 0;

  // 3a. Soil Texture
  if (checkin.soilTexture && checkin.soilTexture !== 'unknown') {
    soilPointsAvailable += 10;
    if (
      crop.preferredSoilTexture &&
      crop.preferredSoilTexture.includes(checkin.soilTexture)
    ) {
      soilPointsEarned += 10;
      reasons.push(
        `Soil texture (${checkin.soilTexture}) matches preferred profile.`,
      );
    } else if (crop.preferredSoilTexture && crop.preferredSoilTexture.length > 0) {
      soilPointsEarned += 5;
      reasons.push(
        `Soil texture (${checkin.soilTexture}) is acceptable though preferred are: ${crop.preferredSoilTexture.join(', ')}.`,
      );
    } else {
      soilPointsEarned += 7;
    }
  } else {
    missingComponents.push('Soil texture unknown (farmer estimate or lab test recommended)');
  }

  // 3b. Soil pH
  if (checkin.soilPH !== null && checkin.soilPH !== undefined) {
    soilPointsAvailable += 10;
    const ph = checkin.soilPH;
    if (crop.soilPHMin !== null && crop.soilPHMax !== null) {
      if (ph >= crop.soilPHMin && ph <= crop.soilPHMax) {
        soilPointsEarned += 10;
        reasons.push(`Soil pH (${ph}) is within ideal agronomic bounds (${crop.soilPHMin}–${crop.soilPHMax}).`);
      } else if (Math.abs(ph - crop.soilPHMin) <= 0.5 || Math.abs(ph - crop.soilPHMax) <= 0.5) {
        soilPointsEarned += 5;
        reasons.push(`Soil pH (${ph}) slightly borders tolerance limit (${crop.soilPHMin}–${crop.soilPHMax}).`);
      } else {
        soilPointsEarned += 2;
        reasons.push(`Soil pH (${ph}) outside optimal range for this crop.`);
      }
    } else {
      soilPointsEarned += 7;
    }
  } else {
    missingComponents.push('Soil pH unknown');
  }

  // 3c. Soil Drainage constraint
  if (checkin.soilDrainage && checkin.soilDrainage !== 'unknown') {
    if (checkin.soilDrainage === 'poor') {
      if (crop.id === 'paddy_rice') {
        reasons.push('Poor field drainage is advantageous for flooded paddy bunding.');
      } else if (crop.family === 'Solanaceae' || crop.name.toLowerCase().includes('maize')) {
        soilPointsEarned = Math.max(0, soilPointsEarned - 4);
        reasons.push('Poor field drainage poses waterlogging and root rot hazards.');
      }
    }
  }

  if (soilPointsAvailable > 0) {
    earnedSoil = (soilPointsEarned / soilPointsAvailable) * weights.soil;
  } else {
    maxSoil = 0; // Renormalize out completely if no soil data available
  }

  // ─────────────────────────────────────────────────────────────
  // 4. SEASON & ROTATION COMPONENT (Default 15 pts)
  // ─────────────────────────────────────────────────────────────
  const currentSeason = getCurrentSeason(referenceDate);

  // 4a. Season fit (8 pts)
  if (crop.season.includes(currentSeason)) {
    earnedSeason += 8;
    reasons.push(`Adapted to active ${currentSeason.toUpperCase()} season cultivation.`);
  } else {
    earnedSeason += 2;
    reasons.push(
      `Traditionally cultivated during ${crop.season.join(' / ').toUpperCase()} season rather than current ${currentSeason.toUpperCase()}.`,
    );
  }

  // 4b. Botanical rotation family (7 pts)
  const currentCropLower = (checkin.currentCrop || '').toLowerCase();
  const prevCropsLower = (checkin.previousCrops || []).map((c) => c.toLowerCase());

  const matchesCurrent =
    currentCropLower.includes(crop.name.toLowerCase()) ||
    currentCropLower.includes(crop.id.replace('_', ' '));

  const matchesPrevFamily = prevCropsLower.some(
    (c) =>
      c.includes(crop.family.toLowerCase()) ||
      c.includes(crop.name.toLowerCase()),
  );

  if (matchesCurrent) {
    earnedSeason += 1;
    reasons.push(
      `Continuous planting of same crop/family (${crop.family}) carries pest/disease build-up penalty.`,
    );
  } else if (matchesPrevFamily) {
    earnedSeason += 4;
    reasons.push(`Similar botanical family (${crop.family}) present in recent seasons.`);
  } else {
    earnedSeason += 7;
    reasons.push(
      `Breaks botanical family cycle (${crop.family}) away from previous crops, helping break pest lifecycles.`,
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 5. FARMER PREFERENCES & LEASE HORIZON (Default 10 pts)
  // ─────────────────────────────────────────────────────────────
  const maxAllowedDays = HARVEST_WINDOW_MAX_DAYS[checkin.harvestWindow] || 120;
  const cropDuration = crop.growthDurationDays ?? 90;

  // 5a. Harvest window fit (6 pts)
  if (cropDuration <= maxAllowedDays) {
    earnedFarmer += 6;
    reasons.push(`Cycle length (~${cropDuration} days) fits within desired ${checkin.harvestWindow} window.`);
  } else {
    earnedFarmer += 2;
    reasons.push(
      `Cycle length (~${cropDuration} days) exceeds preferred harvest window (${checkin.harvestWindow}).`,
    );
  }

  // 5b. Lease Horizon constraint (4 pts)
  if (checkin.landTenure === 'leased' && checkin.leaseEndDate) {
    const leaseEnd = new Date(checkin.leaseEndDate);
    const diffMs = leaseEnd.getTime() - referenceDate.getTime();
    const daysRemaining = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

    if (cropDuration <= daysRemaining) {
      earnedFarmer += 4;
      reasons.push(
        `Harvest completes well ahead of tenancy expiration (${daysRemaining} days remaining).`,
      );
    } else {
      earnedFarmer = 0;
      reasons.push(
        `CRITICAL RISK: Growth duration (~${cropDuration} d) exceeds remaining lease period (${daysRemaining} d).`,
      );
    }
  } else {
    earnedFarmer += 4;
  }

  // ─────────────────────────────────────────────────────────────
  // RENORMALIZATION & DATA COVERAGE
  // ─────────────────────────────────────────────────────────────
  const maxPossible = maxClimate + maxWater + maxSoil + maxSeason + maxFarmer;
  const rawTotal = earnedClimate + earnedWater + earnedSoil + earnedSeason + earnedFarmer;

  let total = 0;
  let dataCoverage = 1.0;

  if (maxPossible > 0) {
    total = Math.round((rawTotal / maxPossible) * 100);
    dataCoverage = Math.round((maxPossible / 100) * 100) / 100;
  }

  const breakdown: ScoreBreakdown = {
    climate: Math.round(earnedClimate * 10) / 10,
    water: Math.round(earnedWater * 10) / 10,
    soil: Math.round(earnedSoil * 10) / 10,
    seasonRotation: Math.round(earnedSeason * 10) / 10,
    farmerPreference: Math.round(earnedFarmer * 10) / 10,
    total,
    maxPossible,
    dataCoverage,
    reasons,
    missingComponents,
  };

  return {
    crop,
    score: breakdown,
    strategy: 'current_practice',
    strategyLabel: 'Current Practice Baseline',
    insufficientData,
  };
}
