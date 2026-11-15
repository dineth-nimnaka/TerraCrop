import type { ClimateData, ClimateDataPoint, ClimateSummary } from '../types/index';

const NASA_POWER_API = 'https://power.larc.nasa.gov/api/temporal/daily/point';

const PARAMETERS = [
  'T2M',
  'T2M_MAX',
  'T2M_MIN',
  'PRECTOTCORR',
  'RH2M',
  'WS2M',
  'ALLSKY_SFC_SW_DWN',
  'GWETROOT',
] as const;

export const NASA_POWER_MISSING_VALUE = -999;

function isMissing(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  const num = typeof value === 'number' ? value : parseFloat(String(value));
  if (isNaN(num) || !Number.isFinite(num)) return true;
  if (num <= -900 || num === NASA_POWER_MISSING_VALUE) return true;
  return false;
}

function formatDateForApi(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

function computeSummary(daily: ClimateDataPoint[]): ClimateSummary {
  let rainfallTotal = 0;
  let rainfallDays = 0;
  let tempSum = 0;
  let tempCount = 0;
  let maxTemp: number | null = null;
  let minTemp: number | null = null;
  let humiditySum = 0;
  let humidityCount = 0;
  let windSum = 0;
  let windCount = 0;
  let solarSum = 0;
  let solarCount = 0;
  let moistureSum = 0;
  let moistureCount = 0;
  let missingDataPoints = 0;
  let hasRainfall = false;

  for (const point of daily) {
    let pointHasMissing = false;

    if (!isMissing(point.PRECTOTCORR)) {
      const rain = point.PRECTOTCORR as number;
      rainfallTotal += rain;
      hasRainfall = true;
      if (rain > 0.1) rainfallDays++;
    } else {
      pointHasMissing = true;
    }

    if (!isMissing(point.T2M)) {
      tempSum += point.T2M as number;
      tempCount++;
    } else {
      pointHasMissing = true;
    }

    if (!isMissing(point.T2M_MAX)) {
      const val = point.T2M_MAX as number;
      if (maxTemp === null || val > maxTemp) maxTemp = val;
    }

    if (!isMissing(point.T2M_MIN)) {
      const val = point.T2M_MIN as number;
      if (minTemp === null || val < minTemp) minTemp = val;
    }

    if (!isMissing(point.RH2M)) {
      humiditySum += point.RH2M as number;
      humidityCount++;
    } else {
      pointHasMissing = true;
    }

    if (!isMissing(point.WS2M)) {
      windSum += point.WS2M as number;
      windCount++;
    } else {
      pointHasMissing = true;
    }

    if (!isMissing(point.ALLSKY_SFC_SW_DWN)) {
      solarSum += point.ALLSKY_SFC_SW_DWN as number;
      solarCount++;
    } else {
      pointHasMissing = true;
    }

    if (!isMissing(point.GWETROOT)) {
      moistureSum += point.GWETROOT as number;
      moistureCount++;
    } else {
      pointHasMissing = true;
    }

    if (pointHasMissing) missingDataPoints++;
  }

  return {
    rainfallTotal: hasRainfall ? Math.round(rainfallTotal * 100) / 100 : null,
    rainfallDays,
    avgTemp: tempCount > 0 ? Math.round((tempSum / tempCount) * 100) / 100 : null,
    maxTemp,
    minTemp,
    avgHumidity: humidityCount > 0 ? Math.round((humiditySum / humidityCount) * 100) / 100 : null,
    avgWindSpeed: windCount > 0 ? Math.round((windSum / windCount) * 100) / 100 : null,
    avgSolarRadiation: solarCount > 0 ? Math.round((solarSum / solarCount) * 100) / 100 : null,
    avgRootZoneMoisture:
      moistureCount > 0 ? Math.round((moistureSum / moistureCount) * 100) / 100 : null,
    dataPoints: daily.length,
    missingDataPoints,
  };
}

interface NasaPowerResponse {
  properties: {
    parameter: Record<string, Record<string, number>>;
  };
  geometry: {
    coordinates: [number, number];
  };
}

export async function fetchClimateData(
  latitude: number,
  longitude: number,
  daysBack: number = 90,
): Promise<ClimateData> {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() - 1); // yesterday (latest available data)

  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - daysBack);

  const startStr = formatDateForApi(startDate);
  const endStr = formatDateForApi(endDate);

  const url = new URL(NASA_POWER_API);
  url.searchParams.set('parameters', PARAMETERS.join(','));
  url.searchParams.set('community', 'AG');
  url.searchParams.set('longitude', longitude.toFixed(4));
  url.searchParams.set('latitude', latitude.toFixed(4));
  url.searchParams.set('start', startStr);
  url.searchParams.set('end', endStr);
  url.searchParams.set('format', 'JSON');

  const response = await fetch(url.toString());

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(
      `NASA POWER API request failed (${response.status}): ${errorText}`,
    );
  }

  const data = (await response.json()) as NasaPowerResponse;

  if (!data.properties?.parameter) {
    throw new Error('NASA POWER API returned an unexpected response format.');
  }

  const rawParameters = data.properties.parameter;

  // Collect all unique dates across all parameters
  const dateSet = new Set<string>();
  for (const paramKey of PARAMETERS) {
    const paramData = rawParameters[paramKey];
    if (paramData) {
      for (const dateKey of Object.keys(paramData)) {
        dateSet.add(dateKey);
      }
    }
  }

  const sortedDates = Array.from(dateSet).sort();

  const daily: ClimateDataPoint[] = sortedDates.map((date) => {
    const point: ClimateDataPoint = { date };

    for (const paramKey of PARAMETERS) {
      const rawValue = rawParameters[paramKey]?.[date];
      (point as unknown as Record<string, unknown>)[paramKey] = isMissing(rawValue) ? null : rawValue;
    }

    return point;
  });

  const summary = computeSummary(daily);

  // Build the parameters record preserving raw data
  const parameters: Record<string, Record<string, number>> = {};
  for (const paramKey of PARAMETERS) {
    if (rawParameters[paramKey]) {
      parameters[paramKey] = rawParameters[paramKey];
    }
  }

  return {
    parameters,
    latitude: data.geometry?.coordinates?.[1] ?? latitude,
    longitude: data.geometry?.coordinates?.[0] ?? longitude,
    startDate: startStr,
    endDate: endStr,
    fetchedAt: new Date(),
    daily,
    summary,
  };
}
