import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useFields } from '../hooks/useFields';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { getFieldLandscapeImage } from '../../../utils/cropImages';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { fields, loading } = useFields();

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size="lg" label="Loading your farm workspace..." />
      </div>
    );
  }

  const userDisplayName = user?.displayName || user?.email?.split('@')[0] || 'Farmer';
  const primaryField = fields[0];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Greeting & Location Header (Inspired by Image 2 & 3) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-[#1B4332] via-[#245A43] to-[#1B4332] text-white p-6 sm:p-8 rounded-[28px] shadow-lg relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-emerald-800/80 text-emerald-200 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border border-emerald-700/60">
            <span>📍</span>
            <span>
              {primaryField
                ? [primaryField.village, primaryField.district].filter(Boolean).join(', ') || 'Sri Lanka'
                : 'Sri Lanka'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Hello, {userDisplayName}! 👋
          </h1>
          <p className="text-emerald-100/90 text-sm sm:text-base max-w-xl leading-relaxed">
            Real-time agroclimate insights from NASA POWER to help you plan high-yield, soil-nourishing crop rotations.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link to="/fields/new">
              <Button
                variant="secondary"
                size="md"
                className="bg-white text-[#1B4332] hover:bg-emerald-50 font-extrabold rounded-2xl shadow-sm"
              >
                + Register New Plot
              </Button>
            </Link>
            <Link to="/community">
              <Button
                variant="outline"
                size="md"
                className="border-white/40 text-white hover:bg-white/10 rounded-2xl"
              >
                Community Discussions
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Weather / Health Badge (Right side) */}
        <div className="relative z-10 self-start sm:self-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center min-w-[140px]">
          <div className="text-3xl mb-1">☀️</div>
          <div className="text-2xl font-black">28°C</div>
          <div className="text-[11px] text-emerald-200 font-medium">Optimal Growing</div>
        </div>
      </div>

      {/* Quick Condition Indicators (Inspired by Image 1 & 2) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-emerald-50/80 border border-emerald-100/80 rounded-2xl p-4 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-200/60 text-[#1B4332] flex items-center justify-center text-xl">
            🌱
          </div>
          <div>
            <div className="text-[11px] text-[#475569] font-medium">Active Plots</div>
            <div className="text-lg font-bold text-[#0F172A]">{fields.length} Registered</div>
          </div>
        </div>

        <div className="bg-sky-50/80 border border-sky-100/80 rounded-2xl p-4 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-sky-200/60 text-sky-800 flex items-center justify-center text-xl">
            🛰️
          </div>
          <div>
            <div className="text-[11px] text-[#475569] font-medium">NASA Feed</div>
            <div className="text-lg font-bold text-[#0F172A]">POWER AG Live</div>
          </div>
        </div>

        <div className="bg-amber-50/80 border border-amber-100/80 rounded-2xl p-4 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-200/60 text-amber-800 flex items-center justify-center text-xl">
            🌾
          </div>
          <div>
            <div className="text-[11px] text-[#475569] font-medium">Rotation Model</div>
            <div className="text-lg font-bold text-[#0F172A]">FAO-56 Certified</div>
          </div>
        </div>

        <div className="bg-purple-50/80 border border-purple-100/80 rounded-2xl p-4 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-200/60 text-purple-800 flex items-center justify-center text-xl">
            ✨
          </div>
          <div>
            <div className="text-[11px] text-[#475569] font-medium">AI Insights</div>
            <div className="text-lg font-bold text-[#0F172A]">Gemini 2.0 Ready</div>
          </div>
        </div>
      </div>

      {/* Registered Plots / "Choose Your Farm" Section (Inspired by Image 1) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A]">
              Choose Your Plot ({fields.length})
            </h2>
            <p className="text-xs text-[#475569]">
              Select a field to view NASA climate data, soil check-in, and crop rotation plans.
            </p>
          </div>
          {fields.length > 0 && (
            <Link
              to="/fields"
              className="text-xs font-bold text-[#1B4332] hover:underline flex items-center gap-1"
            >
              <span>Manage All Plots</span>
              <span>→</span>
            </Link>
          )}
        </div>

        {fields.length === 0 ? (
          <Card className="p-8 sm:p-12 text-center space-y-4 rounded-[28px] border-dashed border-2 border-slate-300 bg-white">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#1B4332] flex items-center justify-center mx-auto text-3xl">
              🗺️
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-bold text-[#0F172A]">
                No fields registered yet
              </h3>
              <p className="text-xs sm:text-sm text-[#475569] mt-1">
                Add your field coordinates or tap on the map to set your location in Sri Lanka and fetch real-time NASA climate observations.
              </p>
            </div>
            <Link to="/fields/new">
              <Button variant="primary" size="md" className="rounded-2xl px-6 py-2.5 font-bold">
                + Add Your First Plot
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {fields.map((field, idx) => {
              const photo = getFieldLandscapeImage(idx);
              const locationStr =
                [field.village, field.district].filter(Boolean).join(', ') || 'Sri Lanka';

              return (
                <div
                  key={field.id}
                  className="bg-white rounded-[24px] border border-slate-200/90 shadow-sm hover:shadow-md hover:border-[#1B4332]/40 transition-all overflow-hidden flex flex-col group"
                >
                  {/* Photo Header */}
                  <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                    <img
                      src={photo}
                      alt={field.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-[#1B4332] px-2.5 py-1 rounded-full text-[11px] font-bold shadow-xs">
                      {field.area ? `${field.area} Acres` : 'Active Plot'}
                    </div>
                    <div className="absolute bottom-3 left-3 text-white">
                      <h3 className="font-extrabold text-lg leading-tight drop-shadow-sm">
                        {field.name}
                      </h3>
                      <p className="text-[11px] text-emerald-200 flex items-center gap-1">
                        <span>📍</span> {locationStr}
                      </p>
                    </div>
                  </div>

                  {/* Body & Actions */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <div className="text-xs text-[#475569] space-y-1">
                      <div className="flex justify-between">
                        <span>GPS Coordinates:</span>
                        <span className="font-mono text-slate-700">
                          {field.latitude.toFixed(3)}°N, {field.longitude.toFixed(3)}°E
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                      <Link to={`/fields/${field.id}`} className="w-full">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full rounded-xl text-xs py-2 text-slate-700 hover:text-[#1B4332]"
                        >
                          🛰️ Climate
                        </Button>
                      </Link>
                      <Link to={`/fields/${field.id}/strategies`} className="w-full">
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-full rounded-xl text-xs py-2 font-bold bg-[#1B4332] text-white"
                        >
                          🌱 Plan Crops
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Instant Actions (Inspired by Image 1 & 3) */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-[#0F172A]">Instant Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            to={primaryField ? `/fields/${primaryField.id}/checkin` : '/fields/new'}
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-[#1B4332] shadow-xs hover:shadow-sm transition-all flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#1B4332] flex items-center justify-center text-lg">
                📝
              </div>
              <div>
                <div className="text-sm font-bold text-[#0F172A] group-hover:text-[#1B4332]">
                  Field Check-in
                </div>
                <div className="text-[11px] text-[#64748B]">Update soil & water state</div>
              </div>
            </div>
            <span className="text-slate-400 group-hover:text-[#1B4332] group-hover:translate-x-1 transition-transform">
              →
            </span>
          </Link>

          <Link
            to="/community"
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-[#1B4332] shadow-xs hover:shadow-sm transition-all flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center text-lg">
                💬
              </div>
              <div>
                <div className="text-sm font-bold text-[#0F172A] group-hover:text-[#1B4332]">
                  Farmer Community
                </div>
                <div className="text-[11px] text-[#64748B]">Ask seeds, market & pests</div>
              </div>
            </div>
            <span className="text-slate-400 group-hover:text-[#1B4332] group-hover:translate-x-1 transition-transform">
              →
            </span>
          </Link>

          <Link
            to="/settings"
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-[#1B4332] shadow-xs hover:shadow-sm transition-all flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-lg">
                ⚙️
              </div>
              <div>
                <div className="text-sm font-bold text-[#0F172A] group-hover:text-[#1B4332]">
                  Farm Preferences
                </div>
                <div className="text-[11px] text-[#64748B]">Units, AI toggles & data info</div>
              </div>
            </div>
            <span className="text-slate-400 group-hover:text-[#1B4332] group-hover:translate-x-1 transition-transform">
              →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};
