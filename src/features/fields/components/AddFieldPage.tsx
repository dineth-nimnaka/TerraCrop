import React from 'react';
import { FieldForm } from './FieldForm';
import { useFields } from '../hooks/useFields';
import type { FieldFormData } from '../../../types/index';

export const AddFieldPage: React.FC = () => {
  const { addField } = useFields();

  const handleCreate = async (data: FieldFormData) => {
    await addField(data);
  };

  return (
    <FieldForm
      title="Add New Field"
      submitLabel="Create Field"
      onSubmit={handleCreate}
    />
  );
};
