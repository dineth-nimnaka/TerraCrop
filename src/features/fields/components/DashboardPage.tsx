import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useFields } from '../hooks/useFields';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { fields, loading } = useFields();

  if (loading) {
    return (
      <div className="py-16">
        <LoadingSpinner size="lg" label="Loading dashboard..." />
      </div>
    );
  }

  const userDisplayName = user?.displayName || user?.email?.split('@')[0] || 'Farmer';

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-[#1B4332] text-white rounded-[24px] p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="max-w-2xl relative z-10 space-y-3">
          <div className="inline-flex items-center space-x-2 bg-emerald-800/80 text-emerald-200 px-3 py-1 rounded-full text-xs font-semibold">
            <span>NASA Space Apps 2024 Challenge</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Ayubowan, {userDisplayName}!
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
            Welcome to TerraCrop. Use real NASA POWER daily agroclimatology data to optimize crop rotation, build soil health, and adapt to climate variability in Sri Lanka.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link to="/fields/new">
              <Button
                variant="secondary"
                size="md"
                className="bg-white text-[#1B4332] hover:bg-emerald-50 font-bold"
              >
                + Add New Field
              </Button>
            </Link>
            <Link to="/community">
              <Button
                variant="outline"
                size="md"
                className="border-emerald-300 text-emerald-100 hover:bg-emerald-900/60"
              >
                Community Forum
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative graphic background pattern */}
        <div className="absolute -right-8 -bottom-12 opacity-10 text-[200px] select-none pointer-events-none">
          🌱
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#1B4332] flex items-center justify-center text-xl font-bold">
            🗺️
          </div>
          <div>
            <div className="text-xs font-medium text-[#475569] uppercase tracking-wider">
              Total Plots Registered
            </div>
            <div className="text-2xl font-bold text-[#0F172A]">{fields.length}</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-100 text-[#0369A1] flex items-center justify-center text-xl font-bold">
            🛰️
          </div>
          <div>
            <div className="text-xs font-medium text-[#475569] uppercase tracking-wider">
              Climate Data Feed
            </div>
            <div className="text-base font-bold text-[#0F172A]">NASA POWER AG</div>
            <div className="text-[11px] text-[#64748B]">Active daily stream</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-xl font-bold">
            🌾
          </div>
          <div>
            <div className="text-xs font-medium text-[#475569] uppercase tracking-wider">
              Rotation Engine
            </div>
            <div className="text-base font-bold text-[#0F172A]">Deterministic Rules</div>
            <div className="text-[11px] text-[#64748B]">FAO-56 Penman-Monteith</div>
          </div>
        </Card>
      </div>

      {/* Recent Fields Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#0F172A]">
            Registered Plots ({fields.length})
          </h2>
          {fields.length > 0 && (
            <Link
              to="/fields"
              className="text-sm font-semibold text-[#1B4332] hover:underline"
            >
              View All Fields →
            </Link>
          )}
        </div>

        {fields.length === 0 ? (
          <Card className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#F3F7F4] text-[#1B4332] flex items-center justify-center mx-auto text-2xl">
              📍
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-bold text-[#0F172A]">
                No fields configured yet
              </h3>
              <p className="text-sm text-[#475569] mt-1">
                Add your field coordinates or use the map to pin your plot location in Sri Lanka to unlock NASA climate metrics and crop rotation suggestions.
              </p>
            </div>
            <Link to="/fields/new">
              <Button variant="primary" size="md">
                Add First Plot
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fields.slice(0, 3).map((field) => (
              <Card key={field.id} hoverable className="p-5 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-base text-[#0F172A] mb-1">
                    {field.name}
                  </h3>
                  <p className="text-xs text-[#475569]">
                    {[field.village, field.district].filter(Boolean).join(', ') || 'Sri Lanka'}
                  </p>
                  <p className="text-[11px] font-mono text-slate-400 mt-1">
                    {field.latitude.toFixed(4)}°N, {field.longitude.toFixed(4)}°E
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    to={`/fields/${field.id}`}
                    className="text-xs font-semibold text-[#1B4332] hover:underline"
                  >
                    Open Dashboard →
                  </Link>
                  <Link
                    to={`/fields/${field.id}/strategies`}
                    className="text-xs font-semibold text-[#0369A1] hover:underline"
                  >
                    Plan Rotation
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
