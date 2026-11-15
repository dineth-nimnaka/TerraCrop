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

  const [activeStrategyIndex, setActiveStrategyIndex] = useState<number>(0);
  const [rainfallAdjustment, setRainfallAdjustment] = useState<number>(0);

  const catalogue = useMemo(() => getCropCatalogue(), []);

  // Compute strategies reactively on slider or data changes
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
          label="Running deterministic agronomy engine against NASA POWER data..."
        />
      </div>
    );
  }

  if (!field) {
    return (
      <ErrorState
        title="Field not found"
        message="The selected agricultural plot could not be located."
        onRetry={() => navigate('/fields')}
      />
    );
  }

  if (!checkin) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <EmptyState
          title="Field Check-in Required"
          description="Before comparing crop rotation strategies, please complete the field check-in (current crop, water source, soil properties, and desired harvest window)."
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

  const currentStrategy = strategies[activeStrategyIndex] || strategies[0];

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header */}
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
          <span className="text-[#0F172A] font-semibold">Rotation Strategies</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">
              Crop Rotation Planner: {field.name}
            </h1>
            <p className="text-sm text-[#475569] mt-0.5">
              Science-backed rotation rankings based on NASA POWER agroclimate data and FAO-56 crop models.
            </p>
          </div>
          <Link to={`/reports/${field.id}`}>
            <Button variant="secondary" size="md">
              Export PDF Report
            </Button>
          </Link>
        </div>
      </div>

      {/* Rainfall What-If Slider Card */}
      <Card className="p-5 bg-gradient-to-r from-sky-50/80 to-emerald-50/80 border border-sky-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-[#0F172A]">
                Rainfall Sensitivity Scenario
              </h2>
              <span className="text-[11px] bg-sky-200/80 text-[#0369A1] font-semibold px-2 py-0.5 rounded-full">
                What-if scenario — not a forecast
              </span>
            </div>
            <p className="text-xs text-[#475569] mt-0.5">
              Test how crop suitability changes under simulated rainfall anomalies (-30% to +30%).
            </p>
          </div>

          <div className="text-right">
            <span className="text-xl font-bold font-mono text-[#0F172A]">
              {rainfallAdjustment > 0 ? `+${rainfallAdjustment}%` : `${rainfallAdjustment}%`}
            </span>
            {climate?.summary?.rainfallTotal && (
              <div className="text-[11px] text-slate-500">
                Effective total: ~
                {(
                  climate.summary.rainfallTotal *
                  (1 + rainfallAdjustment / 100)
                ).toFixed(0)}{' '}
                mm
              </div>
            )}
          </div>
        </div>

        <div className="mt-3">
          <input
            type="range"
            min="-30"
            max="30"
            step="5"
            value={rainfallAdjustment}
            onChange={(e) => setRainfallAdjustment(parseInt(e.target.value, 10))}
            className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1B4332]"
            aria-label="Rainfall What-if Slider"
          />
          <div className="flex justify-between text-[11px] text-slate-500 font-mono mt-1">
            <span>-30% (Severe Drought)</span>
            <span
              onClick={() => setRainfallAdjustment(0)}
              className="cursor-pointer hover:text-[#1B4332] font-semibold"
            >
              0% (Observed Normal)
            </span>
            <span>+30% (Excess Rain)</span>
          </div>
        </div>
      </Card>

      {/* Three Strategy Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex space-x-2 sm:space-x-4 overflow-x-auto pb-1">
          {strategies.map((strat, idx) => {
            const isActive = activeStrategyIndex === idx;
            return (
              <button
                key={strat.strategy}
                onClick={() => setActiveStrategyIndex(idx)}
                type="button"
                className={`min-h-[48px] px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all border-b-2 whitespace-nowrap flex items-center space-x-2 ${
                  isActive
                    ? 'border-[#1B4332] text-[#1B4332] bg-white shadow-xs'
                    : 'border-transparent text-slate-500 hover:text-[#0F172A] hover:bg-slate-100'
                }`}
              >
                <span>
                  {idx === 0 ? '📊' : idx === 1 ? '🌱' : '⚡'}
                </span>
                <span>{strat.label}</span>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  {strat.recommendations.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Strategy Description */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-[#475569]">
        <strong className="text-[#0F172A] block text-sm font-semibold mb-0.5">
          {currentStrategy?.label}
        </strong>
        {currentStrategy?.description}
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {currentStrategy?.recommendations.map((rec) => {
          const scorePercent = rec.score.total;
          const scoreColor =
            scorePercent >= 75
              ? 'bg-emerald-600 text-white'
              : scorePercent >= 50
              ? 'bg-amber-500 text-white'
              : 'bg-slate-500 text-white';

          return (
            <Card key={rec.crop.id} className="p-5 space-y-4 border border-slate-200">
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-[#0F172A]">
                      {rec.crop.name}
                    </h3>
                    <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                      Family: {rec.crop.family}
                    </span>
                    {rec.crop.isLegume && (
                      <span className="text-xs bg-emerald-100 text-[#1B4332] font-semibold px-2 py-0.5 rounded-md">
                        Nitrogen-Fixing Legume
                      </span>
                    )}
                    {rec.crop.isCoverCrop && (
                      <span className="text-xs bg-teal-100 text-teal-800 font-semibold px-2 py-0.5 rounded-md">
                        Soil Cover Crop
                      </span>
                    )}
                    {rec.insufficientData && (
                      <span className="text-xs bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-md">
                        Insufficient Data
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#475569]">
                    Cycle: ~{rec.crop.growthDurationDays || 'N/A'} days • Water demand: ~
                    {rec.crop.waterNeedMmPerCycle || 'N/A'} mm • Drought tolerance:{' '}
                    {rec.crop.droughtTolerance || 'N/A'}
                  </p>
                </div>

                {/* Score badge */}
                <div className="flex items-center space-x-3 self-start sm:self-center">
                  <div className="text-right">
                    <div className="text-xs text-[#64748B]">Suitability</div>
                    <div className="text-[10px] text-slate-400">
                      Coverage: {(rec.score.dataCoverage * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl shadow-xs ${scoreColor}`}
                  >
                    {scorePercent}
                  </div>
                </div>
              </div>

              {/* Score Breakdown Progress Bars */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-100 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] text-[#475569] mb-1">
                    <span>Climate</span>
                    <span className="font-semibold">{rec.score.climate}/30</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full"
                      style={{ width: `${(rec.score.climate / 30) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-[#475569] mb-1">
                    <span>Water</span>
                    <span className="font-semibold">{rec.score.water}/25</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-600 rounded-full"
                      style={{ width: `${(rec.score.water / 25) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-[#475569] mb-1">
                    <span>Soil</span>
                    <span className="font-semibold">{rec.score.soil}/20</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-600 rounded-full"
                      style={{ width: `${(rec.score.soil / 20) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-[#475569] mb-1">
                    <span>Rotation</span>
                    <span className="font-semibold">{rec.score.seasonRotation}/15</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full"
                      style={{ width: `${(rec.score.seasonRotation / 15) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-[#475569] mb-1">
                    <span>Farmer</span>
                    <span className="font-semibold">{rec.score.farmerPreference}/10</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-600 rounded-full"
                      style={{ width: `${(rec.score.farmerPreference / 10) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Reasons & Scientific Context */}
              <div className="space-y-1 pt-1">
                <div className="text-xs font-semibold text-[#0F172A]">
                  Evaluation Factors & Observations:
                </div>
                <ul className="text-xs text-[#475569] space-y-1">
                  {rec.score.reasons.map((reason, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-[#1B4332] font-bold mt-0.5">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Missing components / reduced coverage note */}
              {rec.score.missingComponents.length > 0 && (
                <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 text-[11px] text-amber-800">
                  <strong className="block mb-0.5">Missing Inputs (Renormalized):</strong>
                  {rec.score.missingComponents.join(' • ')}
                </div>
              )}

              {/* Bottom footer: Source URL & Gemini Explanation */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <a
                  href={rec.crop.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-[#0369A1] hover:underline flex items-center space-x-1"
                >
                  <span>Data Source: FAO / DOA Technical Specification ↗</span>
                </a>

                {/* Gemini AI advisory explanation integration */}
                <GeminiExplanation
                  recommendation={rec}
                  dataSources={[
                    'NASA POWER Agroclimatology (AG)',
                    'FAO Irrigation & Drainage Paper 56',
                    'Field Check-in Data',
                  ]}
                  constraints={[
                    `Water Access: ${checkin.waterAccess}`,
                    `Harvest Window: ${checkin.harvestWindow}`,
                    checkin.landTenure === 'leased' ? 'Leased Land' : 'Owned Land',
                  ]}
                  uncertainties={rec.score.missingComponents}
                />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
