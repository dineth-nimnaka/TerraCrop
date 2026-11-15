import { Timestamp } from 'firebase/firestore';

// ─── Auth ───
export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  emailVerified: boolean;
  createdAt: Date;
}

// ─── Fields ───
export interface Field {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  area?: number;
  areaUnit?: 'hectares' | 'acres';
  district?: string;
  village?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type FieldFormData = Omit<Field, 'id' | 'createdAt' | 'updatedAt'>;

// ─── Climate ───
export interface ClimateDataPoint {
  date: string; // YYYYMMDD
  T2M?: number | null;
  T2M_MAX?: number | null;
  T2M_MIN?: number | null;
  PRECTOTCORR?: number | null;
  RH2M?: number | null;
  WS2M?: number | null;
  ALLSKY_SFC_SW_DWN?: number | null;
  GWETROOT?: number | null;
}

export interface ClimateData {
  parameters: Record<string, Record<string, number>>;
  latitude: number;
  longitude: number;
  startDate: string;
  endDate: string;
  fetchedAt: Date;
  daily: ClimateDataPoint[];
  summary: ClimateSummary;
}

export interface ClimateSummary {
  rainfallTotal: number | null;
  rainfallDays: number;
  avgTemp: number | null;
  maxTemp: number | null;
  minTemp: number | null;
  avgHumidity: number | null;
  avgWindSpeed: number | null;
  avgSolarRadiation: number | null;
  avgRootZoneMoisture: number | null;
  dataPoints: number;
  missingDataPoints: number;
}

// ─── Check-in ───
export type SoilProvenance = 'farmer_estimate' | 'lab_test' | 'officer' | 'unknown';
export type LandTenure = 'owned' | 'leased';
export type WaterAccess = 'rain_fed' | 'canal' | 'well';
export type WaterReliability = 'reliable' | 'somewhat_reliable' | 'unreliable';
export type HarvestWindow = '<=60' | '61-90' | '91-120' | '>120';
export type SoilTexture = 'sandy' | 'loamy' | 'clay' | 'silty' | 'unknown';
export type SoilDrainage = 'well_drained' | 'moderate' | 'poor' | 'unknown';
export type WildlifeObserved = 'boar' | 'monkeys' | 'peafowl' | 'elephants';

export interface CheckinData {
  id: string;
  fieldId: string;
  currentCrop: string;
  previousCrops: string[];
  landTenure: LandTenure;
  leaseEndDate?: string; // ISO date
  harvestWindow: HarvestWindow;
  waterAccess: WaterAccess;
  waterReliability?: WaterReliability;
  soilTexture?: SoilTexture;
  soilTextureProvenance?: SoilProvenance;
  soilPH?: number | null;
  soilPHProvenance?: SoilProvenance;
  soilDrainage?: SoilDrainage;
  soilDrainageProvenance?: SoilProvenance;
  organicMatter?: 'low' | 'medium' | 'high' | 'unknown';
  organicMatterProvenance?: SoilProvenance;
  observedWildlife: WildlifeObserved[];
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Crops ───
export interface CropData {
  id: string;
  name: string;
  family: string;
  season: string[];
  minTemp: number | null;
  maxTemp: number | null;
  optimalTempMin: number | null;
  optimalTempMax: number | null;
  waterNeedMmPerCycle: number | null;
  droughtTolerance: 'low' | 'medium' | 'high' | null;
  growthDurationDays: number | null;
  soilPHMin: number | null;
  soilPHMax: number | null;
  preferredSoilTexture: string[] | null;
  kc: number | null;
  kcSource?: string;
  isLegume: boolean;
  isCoverCrop: boolean;
  soilBuildingEvidence?: string;
  sourceUrl: string;
}

export interface CropCatalogue {
  version: string;
  lastUpdated: string;
  crops: CropData[];
}

// ─── Strategy / Scoring ───
export interface ScoreBreakdown {
  climate: number;
  water: number;
  soil: number;
  seasonRotation: number;
  farmerPreference: number;
  total: number;
  maxPossible: number;
  dataCoverage: number;
  reasons: string[];
  missingComponents: string[];
}

export interface CropRecommendation {
  crop: CropData;
  score: ScoreBreakdown;
  strategy: 'current_practice' | 'soil_building' | 'constraint_adapted';
  strategyLabel: string;
  insufficientData: boolean;
}

export interface StrategyResult {
  strategy: 'current_practice' | 'soil_building' | 'constraint_adapted';
  label: string;
  description: string;
  recommendations: CropRecommendation[];
}

export interface ScoreWeights {
  climate: number;
  water: number;
  soil: number;
  seasonRotation: number;
  farmerPreference: number;
}

export const DEFAULT_SCORE_WEIGHTS: ScoreWeights = {
  climate: 30,
  water: 25,
  soil: 20,
  seasonRotation: 15,
  farmerPreference: 10,
};

// ─── Community ───
export type PostCategory = 'crop_question' | 'seed_availability' | 'market_information';

export interface CommunityPost {
  id: string;
  title: string;
  content: string;
  category: PostCategory;
  district?: string;
  authorUid: string;
  authorDisplayName?: string;
  replyCount: number;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface CommunityReply {
  id: string;
  content: string;
  authorUid: string;
  authorDisplayName?: string;
  createdAt: Timestamp;
}

export interface CommunityReport {
  postId: string;
  replyId?: string;
  reporterUid: string;
  reason: string;
  createdAt: Timestamp;
}

// ─── Gemini ───
export interface GeminiExplanation {
  summary: string;
  why_it_may_fit: string;
  risks_to_check: string;
  evidence_references: string[];
  disclaimer: string;
}

// ─── Settings ───
export interface UserSettings {
  displayName?: string;
  units: 'metric' | 'imperial';
  aiExplanationEnabled: boolean;
}

// ─── PDF ───
export interface PDFConsentOptions {
  includeExactCoordinates: boolean;
}
