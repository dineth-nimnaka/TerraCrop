import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useFields } from '../hooks/useFields';
import { useCheckin } from '../../checkin/hooks/useCheckin';
import { FieldMap } from './FieldMap';
import { ClimateDashboard } from '../../climate/components/ClimateDashboard';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { ErrorState } from '../../../components/ui/ErrorState';

export const FieldDetailPage: React.FC = () => {
  const { fieldId } = useParams<{ fieldId: string }>();
  const { fields, loading: fieldsLoading } = useFields();
  const { checkin, loading: checkinLoading } = useCheckin(fieldId);
  const navigate = useNavigate();

  if (fieldsLoading || checkinLoading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size="lg" label="Loading field details..." />
      </div>
    );
  }

  const field = fields.find((f) => f.id === fieldId);

  if (!field) {
    return (
      <ErrorState
        title="Field not found"
        message="The requested plot could not be found."
        onRetry={() => navigate('/fields')}
      />
    );
  }

  const isCheckinDone = Boolean(checkin);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 lg:pb-0">
      {/* Top Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-[24px] border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-[#475569] mb-1">
            <Link to="/fields" className="hover:text-[#1B4332] font-semibold">
              Fields
            </Link>
            <span>/</span>
            <span className="text-[#0F172A] font-bold">{field.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A]">
            {field.name}
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] mt-0.5">
            {[field.village, field.district].filter(Boolean).join(', ') || 'Sri Lanka'} •{' '}
            <span className="font-mono text-xs text-slate-700">
              {field.latitude.toFixed(4)}°N, {field.longitude.toFixed(4)}°E
            </span>
            {field.area && ` • ${field.area} ${field.areaUnit || 'ha'}`}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link to={`/fields/${field.id}/checkin`}>
            <Button
              variant={isCheckinDone ? 'outline' : 'primary'}
              size="md"
              className={`rounded-2xl text-xs sm:text-sm font-bold ${
                !isCheckinDone
                  ? 'bg-[#1B4332] text-white shadow-sm'
                  : 'border-slate-300 hover:border-[#1B4332]'
              }`}
            >
              {isCheckinDone ? 'Edit Check-in' : 'Complete Check-in'}
            </Button>
          </Link>

          <Link to={`/fields/${field.id}/strategies`}>
            <Button
              variant={isCheckinDone ? 'primary' : 'outline'}
              size="md"
              className={`rounded-2xl text-xs sm:text-sm font-bold ${
                isCheckinDone
                  ? 'bg-[#1B4332] text-white shadow-sm hover:bg-[#245A43]'
                  : 'border-slate-300 text-slate-500 hover:border-[#1B4332]'
              }`}
            >
              Plan Crop Rotation
            </Button>
          </Link>

          <Link to={`/reports/${field.id}`}>
            <Button
              variant="secondary"
              size="md"
              className="rounded-2xl text-xs sm:text-sm font-bold bg-slate-100 text-slate-800 hover:bg-slate-200"
            >
              Export PDF
            </Button>
          </Link>
        </div>
      </div>

      {/* 3-Step Guided Journey Stepper (Mobile & Desktop Friendly) */}
      <div className="bg-white p-5 rounded-[24px] border border-slate-200/90 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs text-[#475569]">
          <span className="font-extrabold text-[#1B4332] uppercase tracking-wider text-[11px]">
            Farmer Guided Journey
          </span>
          <span className="font-bold">
            Step {isCheckinDone ? '3 of 3' : '2 of 3'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          {/* Step 1 */}
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
            <div className="text-emerald-700 font-extrabold text-sm mb-0.5">✓ Step 1</div>
            <div className="text-[11px] text-[#0F172A] font-bold">Plot Location</div>
            <div className="text-[10px] text-emerald-600">Saved</div>
          </div>

          {/* Step 2 */}
          <div
            className={`p-3 rounded-2xl border transition-all ${
              isCheckinDone
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-amber-50 border-amber-300 shadow-sm ring-2 ring-amber-400/40'
            }`}
          >
            <div
              className={`font-extrabold text-sm mb-0.5 ${
                isCheckinDone ? 'text-emerald-700' : 'text-amber-800'
              }`}
            >
              {isCheckinDone ? '✓ Step 2' : '👉 Step 2'}
            </div>
            <div className="text-[11px] text-[#0F172A] font-bold">Field Check-in</div>
            <div
              className={`text-[10px] font-medium ${
                isCheckinDone ? 'text-emerald-600' : 'text-amber-700'
              }`}
            >
              {isCheckinDone ? 'Completed' : 'Action Needed'}
            </div>
          </div>

          {/* Step 3 */}
          <div
            className={`p-3 rounded-2xl border transition-all ${
              isCheckinDone
                ? 'bg-sky-50 border-sky-300 shadow-sm ring-2 ring-sky-400/40'
                : 'bg-slate-50 border-slate-200 opacity-60'
            }`}
          >
            <div
              className={`font-extrabold text-sm mb-0.5 ${
                isCheckinDone ? 'text-sky-800' : 'text-slate-400'
              }`}
            >
              {isCheckinDone ? '👉 Step 3' : 'Step 3'}
            </div>
            <div className="text-[11px] text-[#0F172A] font-bold">Plan Crops</div>
            <div
              className={`text-[10px] font-medium ${
                isCheckinDone ? 'text-sky-700' : 'text-slate-400'
              }`}
            >
              {isCheckinDone ? 'Ready to View' : 'Pending Check-in'}
            </div>
          </div>
        </div>
      </div>

      {/* Prominent Next-Step Action Banner */}
      {!isCheckinDone ? (
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-5 sm:p-6 rounded-[24px] shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-block bg-white/20 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[11px] font-bold">
              Action Required to Unlock Crops
            </div>
            <h3 className="text-xl font-extrabold">Next: Tell us what you currently grow</h3>
            <p className="text-xs sm:text-sm text-amber-100 max-w-xl">
              Complete your 1-minute field check-in (water access & current crop) so our algorithm can match the highest-yielding rotation crops.
            </p>
          </div>
          <Link to={`/fields/${field.id}/checkin`}>
            <Button
              variant="secondary"
              size="lg"
              className="bg-white text-amber-900 hover:bg-amber-50 font-black rounded-2xl shadow-sm px-6 whitespace-nowrap"
            >
              Start Field Check-in →
            </Button>
          </Link>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-[#1B4332] to-[#245A43] text-white p-5 sm:p-6 rounded-[24px] shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-block bg-white/20 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[11px] font-bold text-emerald-200">
              Check-in Complete • NASA Weather Ready
            </div>
            <h3 className="text-xl font-extrabold">View Recommended Crop Rotations</h3>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
              Your field parameters and 90-day NASA climate data are fully analyzed. See the best matching crops, soil builders, and drought options.
            </p>
          </div>
          <Link to={`/fields/${field.id}/strategies`}>
            <Button
              variant="secondary"
              size="lg"
              className="bg-white text-[#1B4332] hover:bg-emerald-50 font-black rounded-2xl shadow-sm px-6 whitespace-nowrap"
            >
              View Best Crops Now →
            </Button>
          </Link>
        </div>
      )}

      {/* Field Map Section */}
      <Card className="p-4 rounded-[24px]">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold text-[#0F172A] flex items-center gap-1.5">
            <span>🗺️</span>
            <span>Plot Map Location</span>
          </h2>
          <Link
            to={`/fields/${field.id}/edit`}
            className="text-xs font-semibold text-[#1B4332] hover:underline"
          >
            Edit Coordinates
          </Link>
        </div>
        <FieldMap
          latitude={field.latitude}
          longitude={field.longitude}
          interactive={false}
          height="220px"
        />
      </Card>

      {/* NASA POWER Climate Data Dashboard */}
      <div>
        <div className="mb-3">
          <h2 className="text-xl font-bold text-[#0F172A]">
            Observed Climate Intelligence
          </h2>
          <p className="text-xs text-[#475569]">
            Real daily observations from NASA POWER satellite assimilation models
          </p>
        </div>

        <ClimateDashboard
          fieldId={field.id}
          latitude={field.latitude}
          longitude={field.longitude}
          fieldName={field.name}
        />
      </div>

      {/* Mobile Sticky Next-Step Action Bar (Fixed above floating nav dock) */}
      <div className="lg:hidden fixed bottom-20 left-4 right-4 z-40">
        <Link
          to={
            !isCheckinDone
              ? `/fields/${field.id}/checkin`
              : `/fields/${field.id}/strategies`
          }
          className="block w-full"
        >
          <div
            className={`w-full py-3.5 px-5 rounded-2xl text-white font-extrabold text-sm shadow-2xl flex items-center justify-between ${
              !isCheckinDone
                ? 'bg-amber-600 hover:bg-amber-700 animate-pulse'
                : 'bg-[#1B4332] hover:bg-[#245A43]'
            }`}
          >
            <div className="flex items-center space-x-2">
              <span>{!isCheckinDone ? '👉' : '🌱'}</span>
              <span>
                {!isCheckinDone
                  ? 'Next Step: Complete Check-in'
                  : 'Next Step: View Best Crops'}
              </span>
            </div>
            <span className="text-base">→</span>
          </div>
        </Link>
      </div>
    </div>
  );
};
