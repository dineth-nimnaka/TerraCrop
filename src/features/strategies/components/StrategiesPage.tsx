import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useFields } from '../../fields/hooks/useFields';
import { useCheckin } from '../../checkin/hooks/useCheckin';
import { useClimateData } from '../../climate/hooks/useClimateData';
import { getCropCatalogue } from '../../../domain/agronomy/cropCatalogue';
import { generateStrategies } from '../../../domain/agronomy/strategies';
import { GeminiExplanation } from './GeminiExplanation';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { ErrorState } from '../../../components/ui/ErrorState';
import { EmptyState } from '../../../components/ui/EmptyState';
import { getCropImage } from '../../../utils/cropImages';

export const StrategiesPage: React.FC = () => {
  const { fieldId } = useParams<{ fieldId: string }>();
  const { fields, loading: fieldsLoading } = useFields();
  const { checkin, loading: checkinLoading } = useCheckin(fieldId);
  const navigate = useNavigate();

  const field = fields.find((f) => f.id === fieldId);

  const {
    data: climate,
    loading: climateLoading,
  } = useClimateData(fieldId, field?.latitude, field?.longitude);

  const [activeTab, setActiveTab] = useState<'all' | 'soil' | 'drought'>('all');
  const [rainfallAdjustment, setRainfallAdjustment] = useState<number>(0);
  const [expandedCropId, setExpandedCropId] = useState<string | null>(null);

  const catalogue = useMemo(() => getCropCatalogue(), []);

  // Compute strategies reactively
  const strategies = useMemo(() => {
    if (!checkin) return [];
    return generateStrategies(catalogue.crops, climate, checkin, {
      rainfallAdjustmentPercent: rainfallAdjustment,
    });
  }, [catalogue, climate, checkin, rainfallAdjustment]);

  if (fieldsLoading || checkinLoading || climateLoading) {
    return (
      <div className="py-16">
        <LoadingSpinner
          size="lg"
          label="Analyzing NASA climate data and matching crops for your field..."
        />
      </div>
    );
  }

  if (!field) {
    return (
      <ErrorState
        title="Field not found"
        message="The selected field could not be located."
        onRetry={() => navigate('/fields')}
      />
    );
  }

  if (!checkin) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <EmptyState
          title="Field Check-in Required"
          description="Before comparing crop rotation options, please complete the field check-in with your current crop, water source, and soil details."
          actionLabel="Complete Field Check-in"
          onAction={() => navigate(`/fields/${field.id}/checkin`)}
          icon={
            <svg className="w-8 h-8 text-[#1B4332]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
      </div>
    );
  }

  // Pick strategy recommendations based on simple tabs
  const displayedRecommendations =
    activeTab === 'all'
      ? strategies[0]?.recommendations || []
      : activeTab === 'soil'
      ? strategies[1]?.recommendations || []
      : strategies[2]?.recommendations || [];

  const toggleExpand = (cropId: string) => {
    setExpandedCropId(expandedCropId === cropId ? null : cropId);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb & Title */}
      <div>
        <div className="flex items-center space-x-2 text-xs text-[#475569] mb-1">
          <Link to="/fields" className="hover:text-[#1B4332]">
            Fields
          </Link>
          <span>/</span>
          <Link to={`/fields/${field.id}`} className="hover:text-[#1B4332]">
            {field.name}
          </Link>
          <span>/</span>
          <span className="text-[#0F172A] font-semibold">Crop Rotation Plan</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">
              Next Crop Recommendations
            </h1>
            <p className="text-sm text-[#475569]">
              Plot: <strong className="text-[#0F172A]">{field.name}</strong> • Current crop:{' '}
              <span className="font-semibold text-[#1B4332] bg-emerald-50 px-2 py-0.5 rounded-md">
                {checkin.currentCrop}
              </span>
            </p>
          </div>
          <Link to={`/reports/${field.id}`}>
            <Button variant="secondary" size="md">
              Download PDF Report
            </Button>
          </Link>
        </div>
      </div>

      {/* Farmer Advice Summary Box */}
      <Card className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
        <div className="flex items-start space-x-3">
          <span className="text-3xl">🌾</span>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-[#1B4332]">
              Agronomist Guidance for {field.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              You recently planted <strong>{checkin.currentCrop}</strong>. To keep your soil healthy and prevent pests from building up in the ground, avoid planting the exact same crop again. We recommend rotating to a <strong>soil-building pulse or legume</strong> (such as Green Gram or Cowpea) before returning to cereal crops.
            </p>
          </div>
        </div>
      </Card>

      {/* Interactive Weather Simulation Slider */}
      <Card className="p-4 bg-sky-50/70 border border-sky-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm text-[#0F172A]">
                🌧️ Weather "What-If" Simulation
              </span>
              <span className="text-[11px] bg-sky-100 text-[#0369A1] px-2 py-0.5 rounded-full font-medium">
                Simulation Only
              </span>
            </div>
            <p className="text-xs text-[#475569]">
              Slide to see which crops still survive if this season brings drought or heavy rain.
            </p>
          </div>
          <div className="font-bold text-base font-mono text-[#0369A1] self-end sm:self-center">
            {rainfallAdjustment === 0
              ? 'Normal Weather (0%)'
              : rainfallAdjustment > 0
              ? `+${rainfallAdjustment}% Rain (Heavy)`
              : `${rainfallAdjustment}% Rain (Dry Spell)`}
          </div>
        </div>

        <input
          type="range"
          min="-30"
          max="30"
          step="5"
          value={rainfallAdjustment}
          onChange={(e) => setRainfallAdjustment(parseInt(e.target.value, 10))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1B4332]"
        />
        <div className="flex justify-between text-[11px] text-slate-500 mt-1">
          <span>-30% Drought</span>
          <button
            type="button"
            onClick={() => setRainfallAdjustment(0)}
            className="hover:underline font-semibold text-[#1B4332]"
          >
            Reset to Normal
          </button>
          <span>+30% Excess Rain</span>
        </div>
      </Card>

      {/* Easy Farmer Category Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`min-h-[48px] px-4 py-2 text-sm font-bold rounded-xl transition-all flex items-center space-x-2 ${
            activeTab === 'all'
              ? 'bg-[#1B4332] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <span>🏆</span>
          <span>Best Matches (All)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('soil')}
          className={`min-h-[48px] px-4 py-2 text-sm font-bold rounded-xl transition-all flex items-center space-x-2 ${
            activeTab === 'soil'
              ? 'bg-[#1B4332] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <span>🌱</span>
          <span>Soil Builders (Legumes)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('drought')}
          className={`min-h-[48px] px-4 py-2 text-sm font-bold rounded-xl transition-all flex items-center space-x-2 ${
            activeTab === 'drought'
              ? 'bg-[#1B4332] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <span>☀️</span>
          <span>Drought Resilient</span>
        </button>
      </div>

      {/* Clean Crop Cards List */}
      <div className="space-y-4">
        {displayedRecommendations.map((rec, index) => {
          const isExpanded = expandedCropId === rec.crop.id;
          const score = rec.score.total;

          const fitBadge =
            score >= 85
              ? { text: '⭐⭐⭐ Excellent Choice', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' }
              : score >= 65
              ? { text: '⭐⭐ Good Option', color: 'bg-teal-100 text-teal-800 border-teal-300' }
              : { text: '⭐ Moderate / Conditional', color: 'bg-amber-100 text-amber-900 border-amber-300' };

          return (
            <Card
              key={rec.crop.id}
              className="p-5 sm:p-6 border border-slate-200/90 rounded-[24px] hover:border-[#1B4332]/50 hover:shadow-md transition-all space-y-4 bg-white"
            >
              {/* Header with Crop Image (Inspired by Image 1 & 3) */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-200 shadow-xs">
                    <img
                      src={getCropImage(rec.crop.id)}
                      alt={rec.crop.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                      #{index + 1}
                    </div>
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg sm:text-xl font-extrabold text-[#0F172A]">
                        {rec.crop.name}
                      </h3>
                      <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${fitBadge.color}`}>
                        {fitBadge.text}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Family: <strong>{rec.crop.family}</strong>
                      {rec.crop.isLegume && ' • 🌱 Nitrogen-Fixing Legume'}
                      {rec.crop.isCoverCrop && ' • 🛡️ Soil Cover Crop'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-start sm:self-center">
                  <div className="text-right hidden sm:block">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Suitability</div>
                    <div className="text-xs text-emerald-700 font-medium">NASA + FAO</div>
                  </div>
                  <div className="px-3.5 py-1.5 bg-[#1B4332] text-white rounded-2xl font-black text-lg shadow-sm">
                    {score}%
                  </div>
                </div>
              </div>

              {/* 3 Quick Farmer Indicators */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl text-center text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Harvest In</span>
                  <strong className="text-[#0F172A] text-sm">
                    ~{rec.crop.growthDurationDays} Days
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Water Need</span>
                  <strong className="text-[#0F172A] text-sm capitalize">
                    {rec.crop.waterNeedMmPerCycle && rec.crop.waterNeedMmPerCycle > 600
                      ? 'High'
                      : rec.crop.waterNeedMmPerCycle && rec.crop.waterNeedMmPerCycle > 350
                      ? 'Medium'
                      : 'Low'}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Drought Resistance</span>
                  <strong className="text-[#0F172A] text-sm capitalize">
                    {rec.crop.droughtTolerance || 'Normal'}
                  </strong>
                </div>
              </div>

              {/* Top Plain Reasons */}
              <div className="space-y-1">
                <div className="text-xs font-semibold text-[#0F172A]">
                  Why this crop makes sense for your land:
                </div>
                <ul className="text-xs text-slate-600 space-y-1">
                  {rec.score.reasons.slice(0, 3).map((reason, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-[#1B4332] font-bold">✓</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* AI Explanation Component */}
              <GeminiExplanation
                recommendation={rec}
                dataSources={[
                  'NASA POWER Agroclimatology (AG)',
                  'FAO Paper 56 Crop Water Data',
                  'Field Check-in Data',
                ]}
                constraints={[
                  `Current Crop: ${checkin.currentCrop}`,
                  `Water Access: ${checkin.waterAccess}`,
                  `Harvest Window: ${checkin.harvestWindow}`,
                ]}
                uncertainties={rec.score.missingComponents}
              />

              {/* Collapsible Scientific Breakdown for Extension Officers */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => toggleExpand(rec.crop.id)}
                  className="text-xs font-semibold text-[#1B4332] hover:underline flex items-center space-x-1"
                >
                  <span>{isExpanded ? '▴ Hide Scientific Breakdown' : '▾ View Scientific Breakdown (FAO-56 & Scores)'}</span>
                </button>

                {isExpanded && (
                  <div className="mt-3 p-4 bg-slate-50 rounded-xl space-y-3 text-xs border border-slate-200 animate-in fade-in">
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                      <div className="p-2 bg-white rounded-lg border border-slate-200">
                        <span className="text-slate-400 block text-[10px]">Climate (30)</span>
                        <strong className="text-emerald-700 font-bold">{rec.score.climate} pts</strong>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-slate-200">
                        <span className="text-slate-400 block text-[10px]">Water (25)</span>
                        <strong className="text-sky-700 font-bold">{rec.score.water} pts</strong>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-slate-200">
                        <span className="text-slate-400 block text-[10px]">Soil (20)</span>
                        <strong className="text-amber-700 font-bold">{rec.score.soil} pts</strong>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-slate-200">
                        <span className="text-slate-400 block text-[10px]">Rotation (15)</span>
                        <strong className="text-indigo-700 font-bold">{rec.score.seasonRotation} pts</strong>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-slate-200">
                        <span className="text-slate-400 block text-[10px]">Farmer Fit (10)</span>
                        <strong className="text-teal-700 font-bold">{rec.score.farmerPreference} pts</strong>
                      </div>
                    </div>

                    {rec.score.missingComponents.length > 0 && (
                      <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg">
                        <strong>Renormalized Components:</strong> {rec.score.missingComponents.join(', ')}
                      </div>
                    )}

                    <div className="text-[11px] text-slate-500">
                      Scientific Reference:{' '}
                      <a
                        href={rec.crop.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#0369A1] underline"
                      >
                        FAO Irrigation and Drainage Paper 56 Specification ↗
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
