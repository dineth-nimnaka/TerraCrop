import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FieldMap } from './FieldMap';
import { reverseGeocode } from '../../../services/nominatim';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import type { FieldFormData } from '../../../types/index';

interface FieldFormProps {
  initialData?: FieldFormData;
  onSubmit: (data: FieldFormData) => Promise<string | void>;
  submitLabel?: string;
  title: string;
}

export const FieldForm: React.FC<FieldFormProps> = ({
  initialData,
  onSubmit,
  submitLabel = 'Save Field',
  title,
}) => {
  const navigate = useNavigate();

  const [name, setName] = useState(initialData?.name || '');
  const [area, setArea] = useState<string>(
    initialData?.area !== undefined && initialData?.area !== null
      ? String(initialData.area)
      : '',
  );
  const [areaUnit, setAreaUnit] = useState<'hectares' | 'acres'>(
    initialData?.areaUnit || 'hectares',
  );
  const [latitude, setLatitude] = useState<number>(
    initialData?.latitude || 7.8731, // Default Sri Lanka center
  );
  const [longitude, setLongitude] = useState<number>(
    initialData?.longitude || 80.7718,
  );
  const [district, setDistrict] = useState<string>(initialData?.district || '');
  const [village, setVillage] = useState<string>(initialData?.village || '');
  const [geoLoading, setGeoLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Auto-reverse geocode when lat/lng changes
  useEffect(() => {
    let isCancelled = false;

    const fetchGeo = async () => {
      setGeoLoading(true);
      try {
        const geo = await reverseGeocode(latitude, longitude);
        if (!isCancelled) {
          if (geo.district) setDistrict(geo.district);
          if (geo.village) setVillage(geo.village);
        }
      } catch (err) {
        console.warn('Geocoding lookup error:', err);
      } finally {
        if (!isCancelled) setGeoLoading(false);
      }
    };

    const timer = setTimeout(fetchGeo, 800);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [latitude, longitude]);

  const handleMapLocationChange = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please provide a field name.');
      return;
    }

    if (isNaN(latitude) || latitude < -90 || latitude > 90) {
      setError('Latitude must be a valid number between -90 and 90.');
      return;
    }

    if (isNaN(longitude) || longitude < -180 || longitude > 180) {
      setError('Longitude must be a valid number between -180 and 180.');
      return;
    }

    const parsedArea = area.trim() ? parseFloat(area.trim()) : undefined;
    if (parsedArea !== undefined && (isNaN(parsedArea) || parsedArea <= 0)) {
      setError('Field area must be a positive number.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await onSubmit({
        name: trimmedName,
        latitude,
        longitude,
        area: parsedArea,
        areaUnit,
        district: district.trim() || undefined,
        village: village.trim() || undefined,
      });

      if (typeof result === 'string' && result) {
        // Newly created field -> guide directly to Step 2 (Check-in)!
        navigate(`/fields/${result}/checkin`);
      } else {
        navigate('/fields');
      }
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Failed to save field. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0F172A]">{title}</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/fields')}
        >
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {error && (
          <div
            className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm"
            role="alert"
          >
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form Column */}
          <div className="lg:col-span-5 space-y-5">
            <Card>
              <h2 className="text-base font-semibold text-[#0F172A] mb-4">
                Field Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="field-name"
                    className="block text-sm font-medium text-[#0F172A] mb-1"
                  >
                    Field Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="field-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. North Paddy Block A"
                    className="w-full min-h-[48px] px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1B4332] text-base"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="field-area"
                      className="block text-sm font-medium text-[#0F172A] mb-1"
                    >
                      Area (Optional)
                    </label>
                    <input
                      id="field-area"
                      type="number"
                      step="0.01"
                      min="0"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      placeholder="e.g. 2.5"
                      className="w-full min-h-[48px] px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1B4332] text-base"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="area-unit"
                      className="block text-sm font-medium text-[#0F172A] mb-1"
                    >
                      Unit
                    </label>
                    <select
                      id="area-unit"
                      value={areaUnit}
                      onChange={(e) =>
                        setAreaUnit(e.target.value as 'hectares' | 'acres')
                      }
                      className="w-full min-h-[48px] px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1B4332] bg-white text-base"
                    >
                      <option value="hectares">Hectares (ha)</option>
                      <option value="acres">Acres (ac)</option>
                    </select>
                  </div>
                </div>

                {/* Location Geocoding Output */}
                <div className="p-3.5 bg-[#F3F7F4] rounded-xl border border-slate-200">
                  <div className="text-xs font-semibold text-[#1B4332] uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Detected Administrative Region</span>
                    {geoLoading && (
                      <span className="w-3.5 h-3.5 border-2 border-[#1B4332] border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>
                  <div className="text-sm text-[#0F172A] font-medium">
                    {district || village ? (
                      <span>
                        {[village, district].filter(Boolean).join(', ')}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">
                        {geoLoading ? 'Resolving location...' : 'Pin location on map'}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Powered by Nominatim / OpenStreetMap
                  </div>
                </div>

                {/* Manual Lat/Lng Entry */}
                <div className="pt-2 border-t border-slate-100">
                  <h3 className="text-xs font-semibold text-[#475569] uppercase tracking-wider mb-2">
                    Coordinates (Decimal Degrees)
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="field-lat"
                        className="block text-xs text-[#475569] mb-1"
                      >
                        Latitude
                      </label>
                      <input
                        id="field-lat"
                        type="number"
                        step="0.0001"
                        value={latitude}
                        onChange={(e) => setLatitude(parseFloat(e.target.value))}
                        className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="field-lng"
                        className="block text-xs text-[#475569] mb-1"
                      >
                        Longitude
                      </label>
                      <input
                        id="field-lng"
                        type="number"
                        step="0.0001"
                        value={longitude}
                        onChange={(e) => setLongitude(parseFloat(e.target.value))}
                        className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex items-center space-x-3">
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={submitting}
                className="flex-1"
              >
                {submitLabel}
              </Button>
            </div>
          </div>

          {/* Right Map Column */}
          <div className="lg:col-span-7">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-[#0F172A]">
                  Pin Field Location
                </h2>
                <span className="text-xs text-[#475569]">
                  GPS: {latitude.toFixed(4)}, {longitude.toFixed(4)}
                </span>
              </div>
              <FieldMap
                latitude={latitude}
                longitude={longitude}
                onChangeLocation={handleMapLocationChange}
                interactive={true}
                height="450px"
              />
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};
