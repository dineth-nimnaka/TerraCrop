import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FieldForm } from './FieldForm';
import { useFields } from '../hooks/useFields';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { ErrorState } from '../../../components/ui/ErrorState';
import type { FieldFormData } from '../../../types/index';

export const EditFieldPage: React.FC = () => {
  const { fieldId } = useParams<{ fieldId: string }>();
  const { fields, loading, updateField } = useFields();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="py-12">
        <LoadingSpinner size="lg" label="Loading field details..." />
      </div>
    );
  }

  const field = fields.find((f) => f.id === fieldId);

  if (!field) {
    return (
      <ErrorState
        title="Field not found"
        message="The requested field could not be found or may have been deleted."
        onRetry={() => navigate('/fields')}
      />
    );
  }

  const handleUpdate = async (data: FieldFormData) => {
    if (!fieldId) return;
    await updateField(fieldId, data);
  };

  return (
    <FieldForm
      title={`Edit ${field.name}`}
      submitLabel="Update Field"
      initialData={{
        name: field.name,
        latitude: field.latitude,
        longitude: field.longitude,
        area: field.area,
        areaUnit: field.areaUnit,
        district: field.district,
        village: field.village,
      }}
      onSubmit={handleUpdate}
    />
  );
};
