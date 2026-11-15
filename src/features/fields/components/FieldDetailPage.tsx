import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useFields } from '../hooks/useFields';
import { FieldMap } from './FieldMap';
import { ClimateDashboard } from '../../climate/components/ClimateDashboard';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { ErrorState } from '../../../components/ui/ErrorState';

export const FieldDetailPage: React.FC = () => {
  const { fieldId } = useParams<{ fieldId: string }>();
  const { fields, loading } = useFields();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="py-16">
        <LoadingSpinner size="lg" label="Loading field..." />
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

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 sm:p-6 rounded-[24px] border border-slate-200/90 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-xs text-[#475569] mb-1">
            <Link to="/fields" className="hover:text-[#1B4332] font-medium">
              Fields
            </Link>
            <span>/</span>
            <span className="text-[#0F172A] font-semibold">{field.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">
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
              variant="outline"
              size="md"
              className="rounded-2xl text-xs sm:text-sm font-bold border-slate-300 hover:border-[#1B4332]"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              }
            >
              Field Check-in
            </Button>
          </Link>

          <Link to={`/fields/${field.id}/strategies`}>
            <Button
              variant="primary"
              size="md"
              className="rounded-2xl text-xs sm:text-sm font-extrabold bg-[#1B4332] text-white shadow-sm hover:bg-[#245A43]"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
            >
              Plan Crop Rotation
            </Button>
          </Link>

          <Link to={`/reports/${field.id}`}>
            <Button
              variant="secondary"
              size="md"
              className="rounded-2xl text-xs sm:text-sm font-bold bg-slate-100 text-slate-800 hover:bg-slate-200"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
            >
              Export PDF
            </Button>
          </Link>
        </div>
      </div>

      {/* Field Map Section */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-[#0F172A]">
            Field Location Pin
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
    </div>
  );
};
