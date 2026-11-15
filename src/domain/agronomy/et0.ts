/**
 * FAO-56 Penman-Monteith Reference Evapotranspiration (ET0) & Crop ETc
 *
 * References:
 * Allen, R.G., Pereira, L.S., Raes, D., Smith, M., 1998.
 * Crop evapotranspiration - Guidelines for computing crop water requirements.
 * FAO Irrigation and drainage paper 56. Food and Agriculture Organization of the United Nations, Rome.
 */

export interface ET0CalculationResult {
  et0: number | null;
  etc: number | null;
  status: 'computed' | 'unavailable';
  message: string;
  parametersUsed: {
    t2m?: number;
    rh2m?: number;
    ws2m?: number;
    solarRad?: number;
    kc?: number;
  };
}

/**
 * Calculates FAO-56 Penman-Monteith daily reference evapotranspiration (ET0) in mm/day.
 * Only computes when all required meteorological inputs are available and finite.
 */
export function calculateFAO56ET0(inputs: {
  tempCelsius: number | null | undefined;
  relativeHumidityPercent: number | null | undefined;
  windSpeedMps: number | null | undefined;
  solarRadiationMJ: number | null | undefined; // ALLSKY_SFC_SW_DWN in MJ/m2/day
  atmosphericPressureKPa?: number; // Default 101.3 kPa (near sea level)
  kc?: number | null | undefined;
}): ET0CalculationResult {
  const {
    tempCelsius: T,
    relativeHumidityPercent: RH,
    windSpeedMps: u2,
    solarRadiationMJ: Rs,
    atmosphericPressureKPa: P = 101.3,
    kc,
  } = inputs;

  // Validate that all required physical quantities are available and within valid ranges
  if (
    T === null ||
    T === undefined ||
    !Number.isFinite(T) ||
    RH === null ||
    RH === undefined ||
    !Number.isFinite(RH) ||
    RH < 0 ||
    RH > 100 ||
    u2 === null ||
    u2 === undefined ||
    !Number.isFinite(u2) ||
    u2 < 0 ||
    Rs === null ||
    Rs === undefined ||
    !Number.isFinite(Rs) ||
    Rs < 0
  ) {
    return {
      et0: null,
      etc: null,
      status: 'unavailable',
      message: 'Insufficient or missing climate inputs for FAO-56 Penman-Monteith calculation.',
      parametersUsed: {},
    };
  }

  // 1. Slope of saturation vapour pressure curve Delta [kPa/°C]
  const expTerm = Math.exp((17.27 * T) / (T + 237.3));
  const es = 0.6108 * expTerm; // Saturation vapour pressure at air temperature [kPa]
  const delta = (4098 * es) / Math.pow(T + 237.3, 2);

  // 2. Psychrometric constant gamma [kPa/°C]
  const gamma = 0.000665 * P;

  // 3. Actual vapour pressure ea [kPa]
  const ea = (RH / 100) * es;

  // 4. Net shortwave radiation Rns [MJ/m2/day] with standard albedo 0.23 for reference grass
  const albedo = 0.23;
  const Rns = (1 - albedo) * Rs;

  // 5. Net longwave radiation Rnl approximation [MJ/m2/day]
  // Stefan-Boltzmann constant sigma = 4.903e-9 MJ K-4 m-2 day-1
  const sigma = 4.903e-9;
  const T_kelvin_4 = Math.pow(T + 273.16, 4);
  const cloudFactor = 0.8; // Representative cloud/clearness ratio
  const Rnl = sigma * T_kelvin_4 * (0.34 - 0.14 * Math.sqrt(Math.max(0, ea))) * cloudFactor;

  // 6. Net radiation Rn [MJ/m2/day]
  const Rn = Math.max(0, Rns - Rnl);

  // 7. Soil heat flux G = 0 for daily intervals
  const G = 0;

  // 8. FAO-56 Penman-Monteith full equation
  const numerator =
    0.408 * delta * (Rn - G) + gamma * (900 / (T + 273)) * u2 * (es - ea);
  const denominator = delta + gamma * (1 + 0.34 * u2);

  const rawET0 = numerator / denominator;
  const et0 = Math.max(0, Math.round(rawET0 * 100) / 100);

  // Calculate crop evapotranspiration ETc if Kc is provided
  let etc: number | null = null;
  if (kc !== null && kc !== undefined && Number.isFinite(kc) && kc > 0) {
    etc = Math.round(et0 * kc * 100) / 100;
  }

  return {
    et0,
    etc,
    status: 'computed',
    message: 'ET0 calculated using full FAO-56 Penman-Monteith formulation.',
    parametersUsed: {
      t2m: T,
      rh2m: RH,
      ws2m: u2,
      solarRad: Rs,
      kc: kc ?? undefined,
    },
  };
}
