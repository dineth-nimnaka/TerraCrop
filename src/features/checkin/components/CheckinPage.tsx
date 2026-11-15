import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useFields } from '../../fields/hooks/useFields';
import { useCheckin } from '../hooks/useCheckin';
import { CheckinForm } from './CheckinForm';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { ErrorState } from '../../../components/ui/ErrorState';
import type { CheckinData } from '../../../types/index';

export const CheckinPage: React.FC = () => {
  const { fieldId } = useParams<{ fieldId: string }>();
  const { fields, loading: fieldsLoading } = useFields();
  const { checkin, loading: checkinLoading, saveCheckin } = useCheckin(fieldId);
  const navigate = useNavigate();

  if (fieldsLoading || checkinLoading) {
    return (
      <div className="py-16">
        <LoadingSpinner size="lg" label="Loading field check-in record..." />
      </div>
    );
  }

  const field = fields.find((f) => f.id === fieldId);

  if (!field) {
    return (
      <ErrorState
        title="Field not found"
        message="The plot for this check-in could not be found."
        onRetry={() => navigate('/fields')}
      />
    );
  }

  const handleSave = async (data: Omit<CheckinData, 'id' | 'createdAt' | 'updatedAt'>) => {
    await saveCheckin(data);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
          <span className="text-[#0F172A] font-semibold">Check-in</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">
          Field Check-in: {field.name}
        </h1>
        <p className="text-sm text-[#475569]">
          Record current cropping status, water access, and soil parameters to power the deterministic rotation engine.
        </p>
      </div>

      <CheckinForm
        initialData={checkin}
        fieldName={field.name}
        onSave={handleSave}
        onCancel={() => navigate(`/fields/${field.id}`)}
      />
    </div>
  );
};
