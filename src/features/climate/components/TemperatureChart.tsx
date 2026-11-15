import React from 'react';
import type { ClimateDataPoint } from '../../../types/index';

interface TemperatureChartProps {
  daily: ClimateDataPoint[];
  height?: number;
}

export const TemperatureChart: React.FC<TemperatureChartProps> = ({
  daily,
  height = 200,
}) => {
  if (!daily || daily.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-xs text-slate-400">
        No temperature data available
      </div>
    );
  }

  // Find min and max for scaling
  let minTemp = 100;
  let maxTemp = -100;

  daily.forEach((d) => {
    [d.T2M, d.T2M_MAX, d.T2M_MIN].forEach((val) => {
      if (val !== null && val !== undefined) {
        if (val < minTemp) minTemp = val;
        if (val > maxTemp) maxTemp = val;
      }
    });
  });

  if (minTemp > maxTemp) {
    minTemp = 15;
    maxTemp = 35;
  } else {
    // Add margin
    minTemp = Math.floor(minTemp - 2);
    maxTemp = Math.ceil(maxTemp + 2);
  }

  const chartWidth = 700;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = height - paddingTop - paddingBottom;

  const getY = (val: number) => {
    const ratio = (val - minTemp) / (maxTemp - minTemp);
    return paddingTop + innerHeight * (1 - ratio);
  };

  const getX = (index: number) => {
    return paddingLeft + (index / (daily.length - 1 || 1)) * innerWidth;
  };

  // Build SVG path strings
  const buildPath = (key: 'T2M' | 'T2M_MAX' | 'T2M_MIN') => {
    let path = '';
    daily.forEach((point, i) => {
      const val = point[key];
      if (val !== null && val !== undefined) {
        const x = getX(i);
        const y = getY(val);
        if (path === '') {
          path = `M ${x} ${y}`;
        } else {
          path += ` L ${x} ${y}`;
        }
      }
    });
    return path;
  };

  const maxPath = buildPath('T2M_MAX');
  const meanPath = buildPath('T2M');
  const minPath = buildPath('T2M_MIN');

  const formatShortDate = (dateStr: string) => {
    if (dateStr.length === 8) {
      return `${dateStr.slice(4, 6)}/${dateStr.slice(6, 8)}`;
    }
    return dateStr;
  };

  const labelInterval = Math.max(1, Math.floor(daily.length / 5));

  return (
    <div className="w-full space-y-2">
      <div className="flex flex-wrap items-center justify-between text-xs gap-2">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-0.5 bg-red-500 inline-block" />
            <span className="text-[#0F172A] font-medium">Max Temp (°C)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-0.5 bg-amber-500 inline-block" />
            <span className="text-[#0F172A] font-medium">Average Temp (°C)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-0.5 bg-blue-500 inline-block" />
            <span className="text-[#0F172A] font-medium">Min Temp (°C)</span>
          </div>
        </div>
        <span className="text-[11px] bg-amber-50 text-amber-800 font-medium px-2 py-0.5 rounded-md">
          NASA Temperature Readings
        </span>
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} ${height}`}
          className="w-full h-auto min-w-[500px]"
        >
          {/* Y-axis gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = paddingTop + innerHeight * (1 - ratio);
            const val = (minTemp + (maxTemp - minTemp) * ratio).toFixed(0);
            return (
              <g key={ratio}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={chartWidth - paddingRight}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeDasharray="3 3"
                />
                <text
                  x={paddingLeft - 6}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="10"
                  fill="#64748B"
                  className="font-mono"
                >
                  {val}°
                </text>
              </g>
            );
          })}

          {/* Polyline paths */}
          {maxPath && (
            <path
              d={maxPath}
              fill="none"
              stroke="#EF4444"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          )}
          {minPath && (
            <path
              d={minPath}
              fill="none"
              stroke="#3B82F6"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          )}
          {meanPath && (
            <path
              d={meanPath}
              fill="none"
              stroke="#F59E0B"
              strokeWidth="2"
              strokeLinecap="round"
            />
          )}

          {/* X-axis date labels */}
          {daily.map((point, index) => {
            if (index % labelInterval === 0 || index === daily.length - 1) {
              const x = getX(index);
              return (
                <text
                  key={`label-${point.date}`}
                  x={x}
                  y={height - 8}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#64748B"
                  className="font-mono"
                >
                  {formatShortDate(point.date)}
                </text>
              );
            }
            return null;
          })}
        </svg>
      </div>

      <div className="text-[11px] text-[#64748B] flex items-center justify-between">
        <span>Source: NASA POWER 2-Meter Temperature Profile (T2M)</span>
        <span>Range: {minTemp}°C to {maxTemp}°C</span>
      </div>
    </div>
  );
};
