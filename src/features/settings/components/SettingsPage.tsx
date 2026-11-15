import React, { useState, useEffect } from 'react';
import { updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../../services/firebase';
import { useAuth } from '../../../hooks/useAuth';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';

export const SettingsPage: React.FC = () => {
  const { user, signOut, sendVerification } = useAuth();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');
  const [aiEnabled, setAiEnabled] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [verificationSending, setVerificationSending] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  // Load user settings from Firestore
  useEffect(() => {
    if (!user) return;

    const loadSettings = async () => {
      try {
        const settingsDocRef = doc(db, 'users', user.uid, 'settings', 'preferences');
        const snap = await getDoc(settingsDocRef);
        if (snap.exists()) {
          const data = snap.data();
          if (data.units) setUnits(data.units);
          if (data.aiExplanationEnabled !== undefined) {
            setAiEnabled(data.aiExplanationEnabled);
          }
        }
      } catch (err) {
        console.warn('Error reading settings doc:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setSaveSuccess(false);

    try {
      // Update Auth display name if changed
      if (displayName.trim() && displayName !== user.displayName) {
        if (auth.currentUser) {
          await updateProfile(auth.currentUser, {
            displayName: displayName.trim(),
          });
        }
      }

      // Update Firestore preferences
      const settingsDocRef = doc(db, 'users', user.uid, 'settings', 'preferences');
      await setDoc(settingsDocRef, {
        displayName: displayName.trim(),
        units,
        aiExplanationEnabled: aiEnabled,
        updatedAt: new Date(),
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleResendVerification = async () => {
    setVerificationSending(true);
    try {
      await sendVerification();
      setVerificationSent(true);
      setTimeout(() => setVerificationSent(false), 5000);
    } catch (err) {
      console.error('Failed to send verification email:', err);
      alert('Unable to send verification email. Please try again later.');
    } finally {
      setVerificationSending(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16">
        <LoadingSpinner size="lg" label="Loading preferences..." />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">
          Account & App Settings
        </h1>
        <p className="text-sm text-[#475569] mt-0.5">
          Manage your profile, scientific units, AI features, and review data source attributions.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm font-semibold">
          ✓ Settings successfully saved!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <Card className="p-6 space-y-4">
          <h2 className="text-base font-bold text-[#0F172A] border-b border-slate-100 pb-3">
            Farmer Profile
          </h2>

          <div>
            <label
              htmlFor="display-name"
              className="block text-sm font-medium text-[#0F172A] mb-1"
            >
              Display Name
            </label>
            <input
              id="display-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Bandara Silva"
              className="w-full min-h-[48px] px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1B4332] text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-1">
              Email Address (Authentication ID)
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl gap-2">
              <span className="text-sm font-medium text-[#0F172A]">
                {user?.email}
              </span>
              <div>
                {user?.emailVerified ? (
                  <span className="inline-flex items-center space-x-1 text-xs bg-emerald-100 text-[#1B4332] font-semibold px-2.5 py-1 rounded-full">
                    <span>✓</span>
                    <span>Verified</span>
                  </span>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-amber-100 text-amber-900 font-semibold px-2 py-0.5 rounded-full">
                      Unverified
                    </span>
                    <button
                      type="button"
                      disabled={verificationSending || verificationSent}
                      onClick={handleResendVerification}
                      className="text-xs text-[#0369A1] font-semibold hover:underline"
                    >
                      {verificationSent
                        ? 'Link Sent!'
                        : verificationSending
                        ? 'Sending...'
                        : 'Resend Verification'}
                    </button>
                  </div>
                )}
              </div>
            </div>
            {!user?.emailVerified && (
              <p className="text-[11px] text-amber-800 mt-1">
                Note: A verified email is required to publish or reply in the Community section.
              </p>
            )}
          </div>
        </Card>

        {/* Application Preferences */}
        <Card className="p-6 space-y-5">
          <h2 className="text-base font-bold text-[#0F172A] border-b border-slate-100 pb-3">
            Preferences & AI Features
          </h2>

          {/* Units */}
          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-2">
              Measurement Units
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2 text-sm cursor-pointer min-h-[44px]">
                <input
                  type="radio"
                  name="units"
                  value="metric"
                  checked={units === 'metric'}
                  onChange={() => setUnits('metric')}
                  className="w-4 h-4 text-[#1B4332] focus:ring-[#1B4332]"
                />
                <span>Metric (Celsius °C, mm rainfall, hectares)</span>
              </label>
              <label className="flex items-center space-x-2 text-sm cursor-pointer min-h-[44px]">
                <input
                  type="radio"
                  name="units"
                  value="imperial"
                  checked={units === 'imperial'}
                  onChange={() => setUnits('imperial')}
                  className="w-4 h-4 text-[#1B4332] focus:ring-[#1B4332]"
                />
                <span>Imperial (Fahrenheit °F, inches, acres)</span>
              </label>
            </div>
          </div>

          {/* AI Explanation Toggle */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <strong className="block text-sm font-semibold text-[#0F172A]">
                  Gemini AI Agronomic Explanations
                </strong>
                <p className="text-xs text-[#475569]">
                  Enable structured AI interpretations of crop rotation rankings via Firebase AI Logic.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={aiEnabled}
                  onChange={(e) => setAiEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1B4332]"></div>
              </label>
            </div>
          </div>
        </Card>

        {/* Data Source Attributions */}
        <Card className="p-6 space-y-4">
          <h2 className="text-base font-bold text-[#0F172A] border-b border-slate-100 pb-3">
            Open Data Sources & Attributions
          </h2>

          <div className="space-y-3 text-xs text-[#475569]">
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <strong className="text-slate-800 block">
                NASA POWER (Prediction Of Worldwide Energy Resources)
              </strong>
              <p>
                Agroclimatology (AG) daily point dataset derived from GMAO MERRA-2 meteorological assimilation and GEOS-5 models. Parameters include T2M, PRECTOTCORR, RH2M, WS2M, ALLSKY_SFC_SW_DWN, and GWETROOT.
              </p>
              <a
                href="https://power.larc.nasa.gov/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0369A1] hover:underline"
              >
                https://power.larc.nasa.gov/ ↗
              </a>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <strong className="text-slate-800 block">
                OpenStreetMap & Nominatim
              </strong>
              <p>
                Cartographic map tiles and reverse geocoding services provided by OpenStreetMap contributors under Open Database License (ODbL).
              </p>
              <a
                href="https://www.openstreetmap.org/copyright"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0369A1] hover:underline"
              >
                © OpenStreetMap contributors ↗
              </a>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <strong className="text-slate-800 block">
                FAO Irrigation and Drainage Paper 56
              </strong>
              <p>
                Standardized reference evapotranspiration (ET0) Penman-Monteith methodology and crop coefficients (Kc) published by the Food and Agriculture Organization of the United Nations (FAO).
              </p>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="danger"
            size="md"
            onClick={() => signOut()}
          >
            Sign Out
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={saving}
            className="min-w-[140px]"
          >
            Save Preferences
          </Button>
        </div>
      </form>
    </div>
  );
};
