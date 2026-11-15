import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFields } from '../hooks/useFields';
import { FieldMap } from './FieldMap';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ErrorState } from '../../../components/ui/ErrorState';
import type { Field } from '../../../types/index';

export const FieldsPage: React.FC = () => {
  const { fields, loading, error, deleteField } = useFields();
  const navigate = useNavigate();

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleDelete = async (fieldId: string) => {
    setDeletingId(fieldId);
    try {
      await deleteField(fieldId);
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Failed to delete field:', err);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="py-16">
        <LoadingSpinner size="lg" label="Loading your fields..." />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load fields"
        message={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            My Farm Fields
          </h1>
          <p className="text-sm text-[#475569] mt-0.5">
            Manage your land parcels and analyze local NASA POWER climate metrics
          </p>
        </div>
        <Link to="/fields/new">
          <Button
            variant="primary"
            size="md"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            Add New Field
          </Button>
        </Link>
      </div>

      {fields.length === 0 ? (
        <EmptyState
          title="No fields added yet"
          description="Add your first agricultural plot to start monitoring NASA climate data and planning crop rotations."
          actionLabel="Add Your First Field"
          onAction={() => navigate('/fields/new')}
          icon={
            <svg className="w-8 h-8 text-[#1B4332]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
      ) : (
        <>
          {/* Map of All Saved Fields */}
          <Card className="p-4 overflow-hidden">
            <div className="flex items-center justify-between mb-3 px-1">
              <div>
                <h2 className="text-base font-semibold text-[#0F172A]">
                  Farm Overview Map
                </h2>
                <p className="text-xs text-[#475569]">
                  Showing {fields.length} field {fields.length === 1 ? 'location' : 'locations'}
                </p>
              </div>
              <span className="text-xs bg-[#E0F2FE] text-[#0369A1] font-medium px-2.5 py-1 rounded-full">
                Interactive Map
              </span>
            </div>
            <FieldMap
              latitude={fields[0]?.latitude}
              longitude={fields[0]?.longitude}
              otherFields={fields}
              interactive={false}
              height="350px"
            />
          </Card>

          {/* Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {fields.map((field: Field) => (
              <Card
                key={field.id}
                className="flex flex-col justify-between hoverable transition-all hover:border-[#1B4332]/30"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-lg font-bold text-[#0F172A] leading-snug">
                      {field.name}
                    </h3>
                    <div className="flex items-center space-x-1">
                      <Link
                        to={`/fields/${field.id}/edit`}
                        className="p-1.5 text-slate-400 hover:text-[#1B4332] rounded-lg transition-colors"
                        title="Edit Field"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(field.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                        title="Delete Field"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Location Info */}
                  <div className="space-y-1.5 text-xs text-[#475569] mb-4">
                    <div className="flex items-center space-x-1.5">
                      <svg className="w-4 h-4 text-[#1B4332] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="font-medium text-[#0F172A]">
                        {[field.village, field.district].filter(Boolean).join(', ') || 'Sri Lanka'}
                      </span>
                    </div>

                    <div className="pl-5 text-slate-500 font-mono text-[11px]">
                      {field.latitude.toFixed(4)}° N, {field.longitude.toFixed(4)}° E
                    </div>

                    {field.area && (
                      <div className="pl-5 text-slate-600">
                        Area: <span className="font-semibold">{field.area}</span> {field.areaUnit || 'ha'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Field Actions */}
                <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                  <Link
                    to={`/fields/${field.id}`}
                    className="w-full min-h-[44px] flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-white rounded-xl text-sm font-bold shadow-xs transition-colors"
                  >
                    <span>Open Field & Next Steps</span>
                    <span>→</span>
                  </Link>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to={`/fields/${field.id}/checkin`}
                      className="min-h-[40px] flex items-center justify-center px-3 py-1.5 bg-[#F3F7F4] hover:bg-slate-200 text-[#1B4332] rounded-xl text-xs font-medium transition-colors"
                    >
                      Field Check-in
                    </Link>
                    <Link
                      to={`/fields/${field.id}/strategies`}
                      className="min-h-[40px] flex items-center justify-center px-3 py-1.5 bg-[#E0F2FE] hover:bg-[#BAE6FD] text-[#0369A1] rounded-xl text-xs font-semibold transition-colors"
                    >
                      Plan Rotation
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Delete Confirmation Modal */}
          {deleteConfirmId && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-[20px] max-w-sm w-full p-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95">
                <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-center text-[#0F172A] mb-1">
                  Delete Field?
                </h3>
                <p className="text-sm text-[#475569] text-center mb-5">
                  Are you sure you want to delete this field? All associated check-in records will also be removed. This action cannot be undone.
                </p>
                <div className="flex space-x-3">
                  <Button
                    variant="ghost"
                    size="md"
                    className="flex-1"
                    onClick={() => setDeleteConfirmId(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    size="md"
                    className="flex-1"
                    loading={deletingId === deleteConfirmId}
                    onClick={() => handleDelete(deleteConfirmId)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
