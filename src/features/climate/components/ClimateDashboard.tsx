import React from 'react';
import { useClimateData } from '../hooks/useClimateData';
import { RainfallChart } from './RainfallChart';
import { TemperatureChart } from './TemperatureChart';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { ErrorState } from '../../../components/ui/ErrorState';

interface ClimateDashboardProps {
  fieldId: string;
  latitude: number;
  longitude: number;
  fieldName: string;
}

export const ClimateDashboard: React.FC<ClimateDashboardProps> = ({
  fieldId,
  latitude,
  longitude,
  fieldName,
}) => {
  const { data, loading, error, isCached, refetch } = useClimateData(
    fieldId,
    latitude,
    longitude,
  );

  if (loading) {
    return (
      <Card className="py-12">
        <LoadingSpinner
          size="lg"
          label="Checking local weather & rainfall patterns..."
        />
        <p className="text-xs text-slate-400 text-center mt-2">
          Retrieving recent climate observations for your field location
        </p>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <ErrorState
        title="NASA POWER API Error"
        message={error || 'Unable to retrieve climate metrics for this location.'}
        onRetry={() => refetch()}
      />
    );
  }

  const { summary, daily, startDate, endDate, fetchedAt } = data;

  const formatDateStr = (str: string) => {
    if (str && str.length === 8) {
      return `${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6, 8)}`;
    }
    return str;
  };

  return (
    <div className="space-y-6">
      {/* Attribution & Status Header Banner */}
      <div className="bg-white rounded-[20px] p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-[#1B4332] text-sm md:text-base">
              Weather & Climate — {fieldName}
            </span>
            <span className="bg-emerald-100 text-[#1B4332] px-2.5 py-0.5 rounded-full font-medium text-[11px]">
              Last 90 Days
            </span>
          </div>
          <div className="text-[#475569] flex flex-wrap gap-x-4 gap-y-1">
            <span>
              <strong>Observed Period:</strong> {formatDateStr(startDate)} to {formatDateStr(endDate)}
            </span>
            <span>
              <strong>Data Source:</strong> NASA POWER Regional Climate System
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3 self-end md:self-center">
          <span className="text-slate-400 text-[11px]">
            {isCached ? 'Saved locally' : 'Live fetched'} (
            {fetchedAt.toLocaleDateString()})
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            icon={
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            }
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Rainfall Total */}
        <Card className="p-4 bg-sky-50/70 border-sky-100">
          <div className="text-[11px] font-semibold text-[#0369A1] uppercase tracking-wider">
            Total Rain
          </div>
          <div className="mt-1 text-2xl font-bold text-[#0F172A]">
            {summary.rainfallTotal !== null ? `${summary.rainfallTotal}` : 'N/A'}
            <span className="text-xs font-normal text-slate-500 ml-1">mm</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1 truncate" title="POWER/MERRA-2 corrected precipitation">
            Rainfall ({summary.rainfallDays} rainy days)
          </div>
        </Card>

        {/* Avg Temperature */}
        <Card className="p-4 bg-amber-50/70 border-amber-100">
          <div className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">
            Mean Temp
          </div>
          <div className="mt-1 text-2xl font-bold text-[#0F172A]">
            {summary.avgTemp !== null ? `${summary.avgTemp}` : 'N/A'}
            <span className="text-xs font-normal text-slate-500 ml-1">°C</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Range: {summary.minTemp}°C – {summary.maxTemp}°C
          </div>
        </Card>

        {/* Relative Humidity */}
        <Card className="p-4 bg-emerald-50/70 border-emerald-100">
          <div className="text-[11px] font-semibold text-[#1B4332] uppercase tracking-wider">
            Air Humidity
          </div>
          <div className="mt-1 text-2xl font-bold text-[#0F172A]">
            {summary.avgHumidity !== null ? `${summary.avgHumidity}` : 'N/A'}
            <span className="text-xs font-normal text-slate-500 ml-1">%</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Average Humidity
          </div>
        </Card>

        {/* Wind Speed */}
        <Card className="p-4 bg-slate-50 border-slate-200">
          <div className="text-[11px] font-semibold text-[#475569] uppercase tracking-wider">
            Wind Speed
          </div>
          <div className="mt-1 text-2xl font-bold text-[#0F172A]">
            {summary.avgWindSpeed !== null ? `${summary.avgWindSpeed}` : 'N/A'}
            <span className="text-xs font-normal text-slate-500 ml-1">m/s</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Average Wind
          </div>
        </Card>

        {/* Solar Radiation */}
        <Card className="p-4 bg-orange-50/70 border-orange-100">
          <div className="text-[11px] font-semibold text-orange-800 uppercase tracking-wider">
            Sunlight
          </div>
          <div className="mt-1 text-2xl font-bold text-[#0F172A]">
            {summary.avgSolarRadiation !== null ? `${summary.avgSolarRadiation}` : 'N/A'}
            <span className="text-xs font-normal text-slate-500 ml-1">MJ</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1 truncate" title="Surface Shortwave Irradiance">
            Daily Sun Exposure
          </div>
        </Card>

        {/* Root Zone Wetness */}
        <Card className="p-4 bg-teal-50/70 border-teal-100">
          <div className="text-[11px] font-semibold text-teal-800 uppercase tracking-wider">
            Soil Wetness
          </div>
          <div className="mt-1 text-2xl font-bold text-[#0F172A]">
            {summary.avgRootZoneMoisture !== null
              ? `${summary.avgRootZoneMoisture}`
              : 'N/A'}
            <span className="text-xs font-normal text-slate-500 ml-1">frac</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1 truncate" title="Root zone soil wetness (0 to 1 fraction)">
            Root-Zone Wetness (0–1)
          </div>
        </Card>
      </div>

      {/* Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <RainfallChart daily={daily} height={220} />
        </Card>
        <Card className="p-5">
          <TemperatureChart daily={daily} height={220} />
        </Card>
      </div>

      {/* Collapsible Scientific Data Details */}
      <details className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#475569] cursor-pointer">
        <summary className="font-semibold text-slate-700 hover:text-[#1B4332] select-none flex items-center gap-1.5">
          <span>ℹ️</span>
          <span>View Scientific Data Source & Details (NASA POWER)</span>
        </summary>
        <div className="mt-2.5 pt-2 border-t border-slate-200 space-y-1.5 text-[11px] leading-relaxed">
          <p>
            <strong>Rainfall:</strong> Derived from NASA POWER / MERRA-2 corrected precipitation model (~50km regional resolution).
          </p>
          <p>
            <strong>Root-Zone Moisture:</strong> Dimensionless wetness fraction (0.0 dry to 1.0 saturated) across the crop root zone.
          </p>
          <p>
            <strong>Data Quality:</strong> Missing values (-999) from satellite sensors are excluded from daily averages to ensure accurate seasonal trends.
          </p>
        </div>
      </details>
    </div>
  );
};
