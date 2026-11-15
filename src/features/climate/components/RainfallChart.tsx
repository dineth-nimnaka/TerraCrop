import React, { useState } from 'react';
import type { ClimateDataPoint } from '../../../types/index';

interface RainfallChartProps {
  daily: ClimateDataPoint[];
  height?: number;
}

export const RainfallChart: React.FC<RainfallChartProps> = ({
  daily,
  height = 200,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<{
    date: string;
    value: number | null;
    x: number;
    y: number;
  } | null>(null);

  if (!daily || daily.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-xs text-slate-400">
        No precipitation data available
      </div>
    );
  }

  // Find max precipitation for scaling (at least 10mm)
  let maxRain = 10;
  daily.forEach((d) => {
    if (d.PRECTOTCORR !== null && d.PRECTOTCORR !== undefined && d.PRECTOTCORR > maxRain) {
      maxRain = d.PRECTOTCORR;
    }
  });

  const chartWidth = 700;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = height - paddingTop - paddingBottom;

  const barWidth = Math.max(2, (innerWidth / daily.length) - 1.5);

  const formatShortDate = (dateStr: string) => {
    // dateStr is YYYYMMDD
    if (dateStr.length === 8) {
      const month = dateStr.slice(4, 6);
      const day = dateStr.slice(6, 8);
      return `${month}/${day}`;
    }
    return dateStr;
  };

  // Sample ~5 date labels across the bottom
  const labelInterval = Math.max(1, Math.floor(daily.length / 5));

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-xs text-[#475569]">
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-xs bg-[#0284C7] inline-block" />
          <span className="font-semibold text-[#0F172A]">
            Daily Corrected Precipitation (PRECTOTCORR)
          </span>
        </div>
        <span className="text-[11px] bg-sky-50 text-[#0369A1] font-medium px-2 py-0.5 rounded-md">
          Unit: mm/day
        </span>
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} ${height}`}
          className="w-full h-auto min-w-[500px]"
          preserveAspectRatio="none"
        >
          {/* Y-axis gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = paddingTop + innerHeight * (1 - ratio);
            const val = (maxRain * ratio).toFixed(0);
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
                  {val}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {daily.map((point, index) => {
            const x = paddingLeft + (index / daily.length) * innerWidth;
            const rain = point.PRECTOTCORR;
            const isMissing = rain === null || rain === undefined;

            if (isMissing) {
              // Missing data indicator: small cross on baseline
              return (
                <text
                  key={point.date}
                  x={x + barWidth / 2}
                  y={paddingTop + innerHeight - 2}
                  textAnchor="middle"
                  fontSize="8"
                  fill="#CBD5E1"
                >
                  ·
                </text>
              );
            }

            const barHeight = Math.max(1, (rain / maxRain) * innerHeight);
            const y = paddingTop + innerHeight - barHeight;

            return (
              <rect
                key={point.date}
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={rain > 15 ? '#0369A1' : '#38BDF8'}
                rx="1"
                className="hover:opacity-80 transition-opacity cursor-pointer"
                onMouseEnter={() =>
                  setHoveredPoint({
                    date: point.date,
                    value: rain,
                    x: x + barWidth / 2,
                    y,
                  })
                }
                onMouseLeave={() => setHoveredPoint(null)}
              />
            );
          })}

          {/* X-axis date labels */}
          {daily.map((point, index) => {
            if (index % labelInterval === 0 || index === daily.length - 1) {
              const x = paddingLeft + (index / daily.length) * innerWidth + barWidth / 2;
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

        {/* Hover Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute bg-[#0F172A] text-white text-xs px-2.5 py-1.5 rounded-lg shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full"
            style={{
              left: `${(hoveredPoint.x / chartWidth) * 100}%`,
              top: `${hoveredPoint.y - 8}px`,
            }}
          >
            <div className="font-semibold">{hoveredPoint.date}</div>
            <div>
              {hoveredPoint.value !== null
                ? `${hoveredPoint.value.toFixed(2)} mm`
                : 'Data missing'}
            </div>
          </div>
        )}
      </div>

      <div className="text-[11px] text-[#64748B] flex items-center justify-between">
        <span>Source: NASA POWER / MERRA-2 corrected precipitation (not GPM)</span>
        <span>Days with rain (&gt;0.1mm): {daily.filter((d) => (d.PRECTOTCORR || 0) > 0.1).length}</span>
      </div>
    </div>
  );
};
