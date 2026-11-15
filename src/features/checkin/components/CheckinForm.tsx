import React, { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import type {
  CheckinData,
  LandTenure,
  HarvestWindow,
  WaterAccess,
  WaterReliability,
  SoilTexture,
  SoilDrainage,
  SoilProvenance,
  WildlifeObserved,
} from '../../../types/index';

interface CheckinFormProps {
  initialData?: CheckinData | null;
  fieldName: string;
  onSave: (data: Omit<CheckinData, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
}

export const CheckinForm: React.FC<CheckinFormProps> = ({
  initialData,
  fieldName,
  onSave,
  onCancel,
}) => {
  const [currentCrop, setCurrentCrop] = useState(initialData?.currentCrop || '');
  const [previousCrops, setPreviousCrops] = useState<string[]>(
    initialData?.previousCrops || [],
  );
  const [newPrevCrop, setNewPrevCrop] = useState('');

  const [landTenure, setLandTenure] = useState<LandTenure>(
    initialData?.landTenure || 'owned',
  );
  const [leaseEndDate, setLeaseEndDate] = useState(
    initialData?.leaseEndDate || '',
  );

  const [harvestWindow, setHarvestWindow] = useState<HarvestWindow>(
    initialData?.harvestWindow || '91-120',
  );

  const [waterAccess, setWaterAccess] = useState<WaterAccess>(
    initialData?.waterAccess || 'rain_fed',
  );
  const [waterReliability, setWaterReliability] = useState<WaterReliability>(
    initialData?.waterReliability || 'reliable',
  );

  // Soil parameters with provenance
  const [soilTexture, setSoilTexture] = useState<SoilTexture>(
    initialData?.soilTexture || 'unknown',
  );
  const [soilTextureProv, setSoilTextureProv] = useState<SoilProvenance>(
    initialData?.soilTextureProvenance || 'unknown',
  );

  const [soilPH, setSoilPH] = useState<string>(
    initialData?.soilPH !== null && initialData?.soilPH !== undefined
      ? String(initialData.soilPH)
      : '',
  );
  const [soilPHProv, setSoilPHProv] = useState<SoilProvenance>(
    initialData?.soilPHProvenance || 'unknown',
  );

  const [soilDrainage, setSoilDrainage] = useState<SoilDrainage>(
    initialData?.soilDrainage || 'unknown',
  );
  const [soilDrainageProv, setSoilDrainageProv] = useState<SoilProvenance>(
    initialData?.soilDrainageProvenance || 'unknown',
  );

  const [organicMatter, setOrganicMatter] = useState<'low' | 'medium' | 'high' | 'unknown'>(
    initialData?.organicMatter || 'unknown',
  );
  const [organicMatterProv, setOrganicMatterProv] = useState<SoilProvenance>(
    initialData?.organicMatterProvenance || 'unknown',
  );

  const [observedWildlife, setObservedWildlife] = useState<WildlifeObserved[]>(
    initialData?.observedWildlife || [],
  );

  const [notes, setNotes] = useState(initialData?.notes || '');

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleAddPrevCrop = () => {
    const trimmed = newPrevCrop.trim();
    if (trimmed && !previousCrops.includes(trimmed)) {
      setPreviousCrops([...previousCrops, trimmed]);
      setNewPrevCrop('');
    }
  };

  const handleRemovePrevCrop = (cropToRemove: string) => {
    setPreviousCrops(previousCrops.filter((c) => c !== cropToRemove));
  };

  const handleToggleWildlife = (animal: WildlifeObserved) => {
    if (observedWildlife.includes(animal)) {
      setObservedWildlife(observedWildlife.filter((a) => a !== animal));
    } else {
      setObservedWildlife([...observedWildlife, animal]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!currentCrop.trim()) {
      setError('Current crop (or fallow status) is required.');
      return;
    }

    if (landTenure === 'leased' && !leaseEndDate) {
      setError('Please provide the lease end date for leased land.');
      return;
    }

    let parsedPH: number | null = null;
    if (soilPH.trim()) {
      const num = parseFloat(soilPH.trim());
      if (isNaN(num) || num < 0 || num > 14) {
        setError('Soil pH must be a number between 0 and 14.');
        return;
      }
      parsedPH = num;
    }

    if (notes.length > 1000) {
      setError('Notes cannot exceed 1000 characters.');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        fieldId: initialData?.fieldId || '',
        currentCrop: currentCrop.trim(),
        previousCrops,
        landTenure,
        leaseEndDate: landTenure === 'leased' ? leaseEndDate : undefined,
        harvestWindow,
        waterAccess,
        waterReliability: waterAccess !== 'rain_fed' ? waterReliability : undefined,
        soilTexture,
        soilTextureProvenance: soilTexture !== 'unknown' ? soilTextureProv : 'unknown',
        soilPH: parsedPH,
        soilPHProvenance: parsedPH !== null ? soilPHProv : 'unknown',
        soilDrainage,
        soilDrainageProvenance: soilDrainage !== 'unknown' ? soilDrainageProv : 'unknown',
        organicMatter,
        organicMatterProvenance: organicMatter !== 'unknown' ? organicMatterProv : 'unknown',
        observedWildlife,
        notes: notes.trim() || undefined,
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Failed to save field check-in record.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {error && (
        <div
          className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm"
          role="alert"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center justify-between"
          role="alert"
        >
          <span>✓ Field check-in successfully saved to Firestore!</span>
          <span className="text-xs text-emerald-600">Updated</span>
        </div>
      )}

      {/* 1. Cropping History */}
      <Card>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-bold text-[#0F172A]">
            1. Cropping History & Rotation
          </h2>
          <span className="text-xs font-semibold text-[#1B4332] bg-emerald-50 px-2 py-0.5 rounded-md">
            {fieldName}
          </span>
        </div>
        <p className="text-xs text-[#475569] mb-4">
          Helps prevent consecutive same-family crops to reduce pathogen carryover.
        </p>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="current-crop"
              className="block text-sm font-medium text-[#0F172A] mb-1"
            >
              Current Crop or State <span className="text-red-500">*</span>
            </label>
            <input
              id="current-crop"
              type="text"
              required
              value={currentCrop}
              onChange={(e) => setCurrentCrop(e.target.value)}
              placeholder="e.g. Paddy (Rice), Maize, or Fallow / Weeds"
              className="w-full min-h-[48px] px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1B4332] text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-1">
              Previous Crops Grown on this Field
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newPrevCrop}
                onChange={(e) => setNewPrevCrop(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddPrevCrop();
                  }
                }}
                placeholder="e.g. Green gram, Black gram, Chilli"
                className="flex-1 min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1B4332] text-sm"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAddPrevCrop}
              >
                + Add Crop
              </Button>
            </div>

            {/* List of Previous Crops */}
            {previousCrops.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {previousCrops.map((crop) => (
                  <span
                    key={crop}
                    className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 text-[#1B4332] border border-emerald-200 rounded-full text-xs font-semibold"
                  >
                    <span>{crop}</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePrevCrop(crop)}
                      className="text-emerald-700 hover:text-red-600 font-bold ml-1 text-sm"
                      title="Remove"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* 2. Land Tenure & Harvest Window */}
      <Card>
        <h2 className="text-base font-bold text-[#0F172A] mb-1">
          2. Land Tenure & Planning Horizon
        </h2>
        <p className="text-xs text-[#475569] mb-4">
          Ensures recommended crops mature before your tenancy expires.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Land Tenure */}
          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-2">
              Land Ownership Status
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2 text-sm cursor-pointer min-h-[44px]">
                <input
                  type="radio"
                  name="tenure"
                  value="owned"
                  checked={landTenure === 'owned'}
                  onChange={() => setLandTenure('owned')}
                  className="w-4 h-4 text-[#1B4332] focus:ring-[#1B4332]"
                />
                <span className="font-medium text-[#0F172A]">Owned</span>
              </label>
              <label className="flex items-center space-x-2 text-sm cursor-pointer min-h-[44px]">
                <input
                  type="radio"
                  name="tenure"
                  value="leased"
                  checked={landTenure === 'leased'}
                  onChange={() => setLandTenure('leased')}
                  className="w-4 h-4 text-[#1B4332] focus:ring-[#1B4332]"
                />
                <span className="font-medium text-[#0F172A]">Leased / Rented</span>
              </label>
            </div>

            {landTenure === 'leased' && (
              <div className="mt-3">
                <label
                  htmlFor="lease-date"
                  className="block text-xs font-medium text-[#475569] mb-1"
                >
                  Lease End Date <span className="text-red-500">*</span>
                </label>
                <input
                  id="lease-date"
                  type="date"
                  required
                  value={leaseEndDate}
                  onChange={(e) => setLeaseEndDate(e.target.value)}
                  className="w-full min-h-[48px] px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1B4332] text-sm"
                />
              </div>
            )}
          </div>

          {/* Harvest Window */}
          <div>
            <label
              htmlFor="harvest-window"
              className="block text-sm font-medium text-[#0F172A] mb-2"
            >
              Desired Harvest Window
            </label>
            <select
              id="harvest-window"
              value={harvestWindow}
              onChange={(e) => setHarvestWindow(e.target.value as HarvestWindow)}
              className="w-full min-h-[48px] px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1B4332] bg-white text-base"
            >
              <option value="<=60">Short duration (≤ 60 days)</option>
              <option value="61-90">Medium duration (61 – 90 days)</option>
              <option value="91-120">Standard cycle (91 – 120 days)</option>
              <option value=">120">Long season (&gt; 120 days)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* 3. Water Access & Reliability */}
      <Card>
        <h2 className="text-base font-bold text-[#0F172A] mb-1">
          3. Water Access & Irrigation
        </h2>
        <p className="text-xs text-[#475569] mb-4">
          Coupled with NASA POWER precipitation data to calculate crop water balance.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-2">
              Primary Water Source
            </label>
            <div className="space-y-2">
              {[
                { value: 'rain_fed', label: 'Rain-fed only (dependent on seasonal rainfall)' },
                { value: 'canal', label: 'Irrigation Canal (Major / Minor scheme)' },
                { value: 'well', label: 'Agro-well / Tube-well / River pump' },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center space-x-2 text-sm cursor-pointer min-h-[40px]"
                >
                  <input
                    type="radio"
                    name="waterAccess"
                    value={opt.value}
                    checked={waterAccess === opt.value}
                    onChange={() => setWaterAccess(opt.value as WaterAccess)}
                    className="w-4 h-4 text-[#1B4332] focus:ring-[#1B4332]"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {waterAccess !== 'rain_fed' && (
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-2">
                Water Supply Reliability
              </label>
              <div className="space-y-2">
                {[
                  { value: 'reliable', label: 'Reliable (Adequate water throughout season)' },
                  { value: 'somewhat_reliable', label: 'Somewhat reliable (Occasional rotational cuts)' },
                  { value: 'unreliable', label: 'Unreliable (High risk of mid-season shortage)' },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-center space-x-2 text-sm cursor-pointer min-h-[40px]"
                  >
                    <input
                      type="radio"
                      name="waterReliability"
                      value={opt.value}
                      checked={waterReliability === opt.value}
                      onChange={() => setWaterReliability(opt.value as WaterReliability)}
                      className="w-4 h-4 text-[#1B4332] focus:ring-[#1B4332]"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* 4. Soil Properties & Provenance */}
      <Card>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-bold text-[#0F172A]">
            4. Soil Characteristics (Optional)
          </h2>
          <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
            "Unknown" Allowed
          </span>
        </div>
        <p className="text-xs text-[#475569] mb-4">
          Each property tracks data provenance. Missing values trigger automatic weight renormalization.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Soil Texture */}
          <div className="space-y-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <label
              htmlFor="soil-texture"
              className="block text-xs font-semibold text-[#0F172A] uppercase tracking-wider"
            >
              Soil Texture
            </label>
            <select
              id="soil-texture"
              value={soilTexture}
              onChange={(e) => setSoilTexture(e.target.value as SoilTexture)}
              className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
            >
              <option value="unknown">Unknown / Not Tested</option>
              <option value="sandy">Sandy (Light, fast draining)</option>
              <option value="loamy">Loamy (Balanced fertility and moisture)</option>
              <option value="clay">Clay (Heavy, high water holding)</option>
              <option value="silty">Silty (Fine, fertile)</option>
            </select>

            {soilTexture !== 'unknown' && (
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">
                  Provenance Source
                </label>
                <select
                  value={soilTextureProv}
                  onChange={(e) => setSoilTextureProv(e.target.value as SoilProvenance)}
                  className="w-full min-h-[38px] px-2 py-1 text-xs rounded-lg border border-slate-300 bg-white"
                >
                  <option value="farmer_estimate">Farmer Estimate (Visual / Feel)</option>
                  <option value="officer">Extension Officer Assessment</option>
                  <option value="lab_test">Laboratory Soil Analysis</option>
                </select>
              </div>
            )}
          </div>

          {/* Soil pH */}
          <div className="space-y-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <label
              htmlFor="soil-ph"
              className="block text-xs font-semibold text-[#0F172A] uppercase tracking-wider"
            >
              Soil pH (0.0 to 14.0)
            </label>
            <input
              id="soil-ph"
              type="number"
              step="0.1"
              min="0"
              max="14"
              value={soilPH}
              onChange={(e) => setSoilPH(e.target.value)}
              placeholder="e.g. 6.5 (leave blank if unknown)"
              className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
            />

            {soilPH.trim() !== '' && (
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">
                  Provenance Source
                </label>
                <select
                  value={soilPHProv}
                  onChange={(e) => setSoilPHProv(e.target.value as SoilProvenance)}
                  className="w-full min-h-[38px] px-2 py-1 text-xs rounded-lg border border-slate-300 bg-white"
                >
                  <option value="farmer_estimate">pH test strip / Farmer estimate</option>
                  <option value="officer">Agricultural Officer Field Kit</option>
                  <option value="lab_test">Certified Lab Soil Test</option>
                </select>
              </div>
            )}
          </div>

          {/* Soil Drainage */}
          <div className="space-y-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <label
              htmlFor="soil-drainage"
              className="block text-xs font-semibold text-[#0F172A] uppercase tracking-wider"
            >
              Field Drainage
            </label>
            <select
              id="soil-drainage"
              value={soilDrainage}
              onChange={(e) => setSoilDrainage(e.target.value as SoilDrainage)}
              className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
            >
              <option value="unknown">Unknown</option>
              <option value="well_drained">Well drained (Water infiltrates readily)</option>
              <option value="moderate">Moderate drainage</option>
              <option value="poor">Poorly drained / Prone to waterlogging</option>
            </select>

            {soilDrainage !== 'unknown' && (
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">
                  Provenance Source
                </label>
                <select
                  value={soilDrainageProv}
                  onChange={(e) => setSoilDrainageProv(e.target.value as SoilProvenance)}
                  className="w-full min-h-[38px] px-2 py-1 text-xs rounded-lg border border-slate-300 bg-white"
                >
                  <option value="farmer_estimate">Farmer Observation</option>
                  <option value="officer">Extension Officer Inspection</option>
                  <option value="lab_test">Hydrological Lab Analysis</option>
                </select>
              </div>
            )}
          </div>

          {/* Organic Matter */}
          <div className="space-y-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <label
              htmlFor="organic-matter"
              className="block text-xs font-semibold text-[#0F172A] uppercase tracking-wider"
            >
              Organic Matter Content
            </label>
            <select
              id="organic-matter"
              value={organicMatter}
              onChange={(e) =>
                setOrganicMatter(e.target.value as 'low' | 'medium' | 'high' | 'unknown')
              }
              className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
            >
              <option value="unknown">Unknown</option>
              <option value="low">Low (&lt; 1%)</option>
              <option value="medium">Medium (1% – 2.5%)</option>
              <option value="high">High (&gt; 2.5%)</option>
            </select>

            {organicMatter !== 'unknown' && (
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">
                  Provenance Source
                </label>
                <select
                  value={organicMatterProv}
                  onChange={(e) => setOrganicMatterProv(e.target.value as SoilProvenance)}
                  className="w-full min-h-[38px] px-2 py-1 text-xs rounded-lg border border-slate-300 bg-white"
                >
                  <option value="farmer_estimate">Farmer Visual / Soil Color</option>
                  <option value="officer">Agricultural Officer Estimate</option>
                  <option value="lab_test">Laboratory Organic Carbon Test</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* 5. Observed Wildlife (Informational only) */}
      <Card>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-bold text-[#0F172A]">
            5. Wildlife Observations (Informational)
          </h2>
          <span className="text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md font-semibold">
            Informational Only
          </span>
        </div>
        <p className="text-xs text-[#475569] mb-4">
          Recorded for awareness and farmer reference. This data never automatically excludes or penalizes crops in the rules engine.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: 'boar' as WildlifeObserved, label: 'Wild Boar (Wal Ura)', icon: '🐗' },
            { id: 'monkeys' as WildlifeObserved, label: 'Monkeys / Toque Macaque', icon: '🐒' },
            { id: 'peafowl' as WildlifeObserved, label: 'Peafowl (Monara)', icon: '🦚' },
            { id: 'elephants' as WildlifeObserved, label: 'Wild Elephants (Ali)', icon: '🐘' },
          ].map((item) => {
            const isChecked = observedWildlife.includes(item.id);
            return (
              <label
                key={item.id}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center cursor-pointer min-h-[64px] transition-all ${
                  isChecked
                    ? 'border-[#1B4332] bg-emerald-50 text-[#1B4332] font-semibold'
                    : 'border-slate-200 bg-white text-[#475569] hover:bg-slate-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleToggleWildlife(item.id)}
                  className="sr-only"
                />
                <span className="text-xl mb-1">{item.icon}</span>
                <span className="text-xs">{item.label}</span>
              </label>
            );
          })}
        </div>
      </Card>

      {/* 6. Notes */}
      <Card>
        <h2 className="text-base font-bold text-[#0F172A] mb-1">
          6. Field Notes
        </h2>
        <p className="text-xs text-[#475569] mb-3">
          Add any additional local context (e.g. salinity patches, shade, slope, weed pressure). Max 1000 chars.
        </p>
        <textarea
          rows={3}
          maxLength={1000}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Lower terrace gets waterlogged during peak Maha rains; salinity present near irrigation tail-end."
          className="w-full p-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1B4332] text-sm"
        />
        <div className="text-right text-[11px] text-slate-400 mt-1">
          {notes.length} / 1000 characters
        </div>
      </Card>

      {/* Form Submission Buttons */}
      <div className="flex items-center justify-end space-x-3 pt-2">
        <Button
          type="button"
          variant="ghost"
          size="md"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={saving}
          className="min-w-[160px]"
        >
          Save Field Check-in
        </Button>
      </div>
    </form>
  );
};
