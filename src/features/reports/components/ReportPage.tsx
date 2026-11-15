import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useFields } from '../../fields/hooks/useFields';
import { useCheckin } from '../../checkin/hooks/useCheckin';
import { useClimateData } from '../../climate/hooks/useClimateData';
import { getCropCatalogue } from '../../../domain/agronomy/cropCatalogue';
import { generateStrategies } from '../../../domain/agronomy/strategies';
import { generateFieldReport } from '../pdfGenerator';
import { useAuth } from '../../../hooks/useAuth';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { ErrorState } from '../../../components/ui/ErrorState';
import { ALGORITHM_VERSION, CATALOGUE_VERSION } from '../../../domain/agronomy/constants';

export const ReportPage: React.FC = () => {
  const { fieldId } = useParams<{ fieldId: string }>();
  const { fields, loading: fieldsLoading } = useFields();
  const { checkin, loading: checkinLoading } = useCheckin(fieldId);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [includeExactCoordinates, setIncludeExactCoordinates] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const field = fields.find((f) => f.id === fieldId);

  const {
    data: climate,
    loading: climateLoading,
  } = useClimateData(fieldId, field?.latitude, field?.longitude);

  const catalogue = useMemo(() => getCropCatalogue(), []);

  const strategies = useMemo(() => {
    if (!checkin) return [];
    return generateStrategies(catalogue.crops, climate, checkin);
  }, [catalogue, climate, checkin]);

  if (fieldsLoading || checkinLoading || climateLoading) {
    return (
      <div className="py-16">
        <LoadingSpinner size="lg" label="Preparing field report compilation..." />
      </div>
    );
  }

  if (!field) {
    return (
      <ErrorState
        title="Field not found"
        message="The plot for this report could not be found."
        onRetry={() => navigate('/fields')}
      />
    );
  }

  const handleDownload = () => {
    setGenerating(true);
    try {
      generateFieldReport({
        field,
        checkin,
        climate,
        strategies,
        consent: { includeExactCoordinates },
        userEmail: user?.email || undefined,
      });
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 5000);
    } catch (err) {
      console.error('Error generating PDF report:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs text-[#475569] mb-1">
          <Link to="/fields" className="hover:text-[#1B4332]">
            Fields
          </Link>
          <span>/</span>
          <Link to={`/fields/${field.id}`} className="hover:text-[#1B4332]">
            {field.name}
          </Link>
          <span>/</span>
          <span className="text-[#0F172A] font-semibold">PDF Report Export</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">
          Export Field Report (A4 PDF)
        </h1>
        <p className="text-sm text-[#475569]">
          Generate a formal, publication-ready A4 agronomic report for offline reference or agricultural extension officer review.
        </p>
      </div>

      {downloadSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-sm font-semibold flex items-center justify-between">
          <span>✓ PDF successfully compiled and downloaded to your device!</span>
        </div>
      )}

      {/* Report Summary Card */}
      <Card className="p-6 space-y-5">
        <h2 className="text-base font-bold text-[#0F172A] border-b border-slate-100 pb-3">
          Report Inclusions & Specification
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#475569]">
          <div className="space-y-2 p-3.5 bg-slate-50 rounded-xl">
            <strong className="block text-slate-800 text-sm font-semibold">
              Field & Climate Data
            </strong>
            <p>• Field: <strong>{field.name}</strong></p>
            <p>• District: {field.district || 'Sri Lanka'}</p>
            <p>
              • NASA POWER Data: {climate ? '90-Day Observation Window' : 'Not Loaded'}
            </p>
            <p>• Atmospheric Resolution: ~0.5° × 0.625° Grid</p>
          </div>

          <div className="space-y-2 p-3.5 bg-slate-50 rounded-xl">
            <strong className="block text-slate-800 text-sm font-semibold">
              Agronomy Engine
            </strong>
            <p>• Engine Algorithm Version: <strong>v{ALGORITHM_VERSION}</strong></p>
            <p>• Crop Catalogue Version: <strong>v{CATALOGUE_VERSION}</strong></p>
            <p>• Active Strategies: <strong>3 Distinct Models</strong></p>
            <p>• References: FAO-56 Penman-Monteith Formulation</p>
          </div>
        </div>

        {/* GPS Consent Checkbox */}
        <div className="p-4 rounded-xl border border-slate-200 bg-[#F3F7F4] space-y-2">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={includeExactCoordinates}
              onChange={(e) => setIncludeExactCoordinates(e.target.checked)}
              className="w-5 h-5 mt-0.5 rounded-md text-[#1B4332] focus:ring-[#1B4332]"
            />
            <div className="text-xs">
              <span className="font-bold text-[#0F172A] block">
                Include Exact GPS Coordinates in Exported PDF
              </span>
              <span className="text-slate-500">
                If unchecked, the PDF will redact exact coordinates to protect your land privacy when sharing this document with third parties.
              </span>
            </div>
          </label>
        </div>

        {/* Mandatory Notice */}
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
          <div className="font-bold flex items-center space-x-1.5">
            <span>⚠️</span>
            <span>Mandatory Verification Notice:</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            The generated document explicitly includes a mandate to verify all crop rotation plans with a local Department of Agriculture extension officer before purchasing seed batches or undertaking land preparation.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={() => navigate(`/fields/${field.id}`)}
          >
            ← Return to Field
          </Button>

          <Button
            type="button"
            variant="primary"
            size="lg"
            loading={generating}
            onClick={handleDownload}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          >
            Generate & Download PDF (A4)
          </Button>
        </div>
      </Card>
    </div>
  );
};
