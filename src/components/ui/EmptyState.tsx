import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`rounded-[20px] bg-white border border-slate-100 shadow-sm p-8 text-center flex flex-col items-center justify-center ${className}`}
    >
      <div className="w-14 h-14 rounded-full bg-[#F3F7F4] text-[#1B4332] flex items-center justify-center mb-4">
        {icon || (
          <svg
            className="w-7 h-7"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        )}
      </div>
      <h3 className="text-lg font-semibold text-[#0F172A] mb-1">{title}</h3>
      <p className="text-sm text-[#475569] max-w-sm mb-5">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          type="button"
          className="min-h-[48px] px-6 py-2.5 bg-[#1B4332] text-white rounded-xl font-medium hover:bg-[#2D6A4F] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:ring-offset-2"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
