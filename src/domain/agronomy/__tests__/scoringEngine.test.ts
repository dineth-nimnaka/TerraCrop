import { describe, it, expect } from 'vitest';
import { evaluateCropSuitability } from '../scoringEngine';
import { generateStrategies } from '../strategies';
import { calculateFAO56ET0 } from '../et0';
import { getCropCatalogue } from '../cropCatalogue';
import type { CropData, ClimateData, CheckinData } from '../../../types/index';

const mockCrop: CropData = {
  id: 'green_gram',
  name: 'Green Gram / Mung Bean',
  family: 'Fabaceae',
  season: ['yala', 'maha'],
  minTemp: 18.0,
  maxTemp: 40.0,
  optimalTempMin: 25.0,
  optimalTempMax: 35.0,
  waterNeedMmPerCycle: 350.0,
  droughtTolerance: 'medium',
  growthDurationDays: 70,
  soilPHMin: 5.5,
  soilPHMax: 7.5,
  preferredSoilTexture: ['loamy', 'sandy'],
  kc: 1.05,
  kcSource: 'FAO 56 Table 12',
  isLegume: true,
  isCoverCrop: false,
  soilBuildingEvidence: 'Nitrogen fixation via Rhizobium symbiosis',
  sourceUrl: 'https://www.fao.org/land-water/databases-and-software/crop-information/grain-legumes/en/',
};

const mockClimate: ClimateData = {
  parameters: {},
  latitude: 7.8731,
  longitude: 80.7718,
  startDate: '20260815',
  endDate: '20261115',
  fetchedAt: new Date(),
  daily: [],
  summary: {
    rainfallTotal: 300.0,
    rainfallDays: 24,
    avgTemp: 28.5,
    maxTemp: 34.0,
    minTemp: 22.0,
    avgHumidity: 78.0,
    avgWindSpeed: 2.3,
    avgSolarRadiation: 19.5,
    avgRootZoneMoisture: 0.65,
    dataPoints: 90,
    missingDataPoints: 0,
  },
};

const mockCheckin: CheckinData = {
  id: 'test_checkin_1',
  fieldId: 'field_1',
  currentCrop: 'Paddy Rice',
  previousCrops: ['Paddy Rice'],
  landTenure: 'owned',
  harvestWindow: '61-90',
  waterAccess: 'rain_fed',
  soilTexture: 'loamy',
  soilTextureProvenance: 'lab_test',
  soilPH: 6.5,
  soilPHProvenance: 'lab_test',
  soilDrainage: 'well_drained',
  soilDrainageProvenance: 'officer',
  organicMatter: 'medium',
  organicMatterProvenance: 'lab_test',
  observedWildlife: ['peafowl'],
  notes: 'Sandy clay loam terrace.',
  createdAt: {} as any,
  updatedAt: {} as any,
};

describe('Agronomy Scoring Engine', () => {
  it('computes positive score and breakdown with complete data', () => {
    const rec = evaluateCropSuitability(mockCrop, mockClimate, mockCheckin);

    expect(rec.score.total).toBeGreaterThan(0);
    expect(rec.score.total).toBeLessThanOrEqual(100);
    expect(rec.score.climate).toBeGreaterThan(0);
    expect(rec.score.water).toBeGreaterThan(0);
    expect(rec.score.soil).toBeGreaterThan(0);
    expect(rec.score.seasonRotation).toBeGreaterThan(0);
    expect(rec.score.farmerPreference).toBeGreaterThan(0);
    expect(rec.score.dataCoverage).toBe(1.0);
    expect(rec.score.reasons.length).toBeGreaterThan(0);
    expect(rec.insufficientData).toBe(false);
  });

  it('renormalizes missing climate data without inventing zero values', () => {
    const rec = evaluateCropSuitability(mockCrop, null, mockCheckin);

    expect(rec.score.total).toBeGreaterThan(0);
    expect(rec.score.total).toBeLessThanOrEqual(100);
    expect(rec.score.dataCoverage).toBeLessThan(1.0);
    expect(rec.score.missingComponents).toContain(
      'Observed temperature data unavailable from NASA POWER',
    );
  });

  it('renormalizes missing soil data when texture and pH are unknown', () => {
    const checkinWithoutSoil: CheckinData = {
      ...mockCheckin,
      soilTexture: 'unknown',
      soilPH: null,
      soilDrainage: 'unknown',
      organicMatter: 'unknown',
    };

    const rec = evaluateCropSuitability(mockCrop, mockClimate, checkinWithoutSoil);

    expect(rec.score.total).toBeGreaterThan(0);
    expect(rec.score.dataCoverage).toBe(0.8); // 80% coverage (soil 20% excluded)
    expect(rec.score.missingComponents).toContain('Soil texture unknown (farmer estimate or lab test recommended)');
    expect(rec.score.missingComponents).toContain('Soil pH unknown');
  });

  it('adjusts water score dynamically with rainfall what-if scenario', () => {
    const normal = evaluateCropSuitability(mockCrop, mockClimate, mockCheckin, {
      rainfallAdjustmentPercent: 0,
    });
    const minus30 = evaluateCropSuitability(mockCrop, mockClimate, mockCheckin, {
      rainfallAdjustmentPercent: -30,
    });
    const plus30 = evaluateCropSuitability(mockCrop, mockClimate, mockCheckin, {
      rainfallAdjustmentPercent: 30,
    });

    expect(minus30.score.water).toBeLessThanOrEqual(normal.score.water);
    expect(plus30.score.water).toBeGreaterThanOrEqual(normal.score.water);
  });

  it('penalizes same-family monoculture carryover', () => {
    const checkinAfterPaddy: CheckinData = {
      ...mockCheckin,
      currentCrop: 'Paddy Rice',
      previousCrops: ['Paddy Rice'],
    };

    const catalogue = getCropCatalogue();
    const paddyCrop = catalogue.crops.find((c) => c.id === 'paddy_rice');
    expect(paddyCrop).toBeDefined();

    if (paddyCrop) {
      const rec = evaluateCropSuitability(paddyCrop, mockClimate, checkinAfterPaddy);
      const monocultureReason = rec.score.reasons.find((r) =>
        r.toLowerCase().includes('same crop/family'),
      );
      expect(monocultureReason).toBeDefined();
    }
  });

  it('generates 3 distinct strategies with evidence requirements', () => {
    const catalogue = getCropCatalogue();
    const strategies = generateStrategies(catalogue.crops, mockClimate, mockCheckin);

    expect(strategies).toHaveLength(3);
    expect(strategies[0].strategy).toBe('current_practice');
    expect(strategies[1].strategy).toBe('soil_building');
    expect(strategies[2].strategy).toBe('constraint_adapted');

    // Strategy 2: all crops MUST be legume/cover crops with evidence
    for (const rec of strategies[1].recommendations) {
      expect(rec.crop.isLegume || rec.crop.isCoverCrop).toBe(true);
      expect(rec.crop.soilBuildingEvidence).toBeTruthy();
    }
  });
});

describe('FAO-56 Penman-Monteith ET0 Calculation', () => {
  it('computes valid reference ET0 and ETc with standard atmospheric inputs', () => {
    const res = calculateFAO56ET0({
      tempCelsius: 28.0,
      relativeHumidityPercent: 75.0,
      windSpeedMps: 2.5,
      solarRadiationMJ: 20.0,
      kc: 1.05,
    });

    expect(res.status).toBe('computed');
    expect(res.et0).toBeGreaterThan(2.0);
    expect(res.et0).toBeLessThan(10.0);
    expect(res.etc).toBeGreaterThan(2.0);
  });

  it('returns status unavailable when required meteorological data is missing', () => {
    const res = calculateFAO56ET0({
      tempCelsius: 28.0,
      relativeHumidityPercent: null,
      windSpeedMps: 2.5,
      solarRadiationMJ: 20.0,
    });

    expect(res.status).toBe('unavailable');
    expect(res.et0).toBeNull();
    expect(res.etc).toBeNull();
  });
});
