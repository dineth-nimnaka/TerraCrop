const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse';
const USER_AGENT = 'TerraCrop/1.0 (crop-planning-app)';
const MIN_REQUEST_INTERVAL_MS = 1100; // >1 second between requests

interface NominatimResult {
  district?: string;
  village?: string;
}

interface NominatimAddress {
  village?: string;
  town?: string;
  city?: string;
  county?: string;
  state_district?: string;
  state?: string;
  suburb?: string;
  hamlet?: string;
}

interface NominatimResponse {
  address?: NominatimAddress;
}

// ── Throttle ──
let lastRequestTime = 0;

async function throttle(): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < MIN_REQUEST_INTERVAL_MS) {
    await new Promise<void>((resolve) =>
      setTimeout(resolve, MIN_REQUEST_INTERVAL_MS - elapsed),
    );
  }
  lastRequestTime = Date.now();
}

// ── Cache ──
const cache = new Map<string, NominatimResult>();

function cacheKey(lat: number, lon: number): string {
  return `${lat.toFixed(4)},${lon.toFixed(4)}`;
}

// ── Public API ──
export async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<NominatimResult> {
  const key = cacheKey(latitude, longitude);

  const cached = cache.get(key);
  if (cached) return cached;

  await throttle();

  const url = new URL(NOMINATIM_URL);
  url.searchParams.set('lat', latitude.toString());
  url.searchParams.set('lon', longitude.toString());
  url.searchParams.set('format', 'json');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('zoom', '14');

  const response = await fetch(url.toString(), {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(
      `Nominatim reverse geocode failed (${response.status}): ${response.statusText}`,
    );
  }

  const data = (await response.json()) as NominatimResponse;
  const address = data.address;

  const result: NominatimResult = {};

  if (address) {
    // District: prefer state_district, then county, then state
    result.district =
      address.state_district ?? address.county ?? address.state ?? undefined;

    // Village: prefer village, then town, then hamlet, then suburb, then city
    result.village =
      address.village ?? address.town ?? address.hamlet ?? address.suburb ?? address.city ?? undefined;
  }

  cache.set(key, result);
  return result;
}

export function clearGeoCache(): void {
  cache.clear();
}
