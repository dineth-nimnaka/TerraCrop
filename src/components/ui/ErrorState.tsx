import React from 'react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`rounded-[20px] bg-red-50 border border-red-200 p-6 text-center ${className}`}
      role="alert"
    >
      <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto mb-3">
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-[#0F172A] mb-1">{title}</h3>
      <p className="text-sm text-[#475569] max-w-md mx-auto mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          type="button"
          className="min-h-[48px] px-5 py-2.5 bg-[#1B4332] text-white rounded-xl font-medium hover:bg-[#2D6A4F] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:ring-offset-2"
        >
          Try Again
        </button>
      )}
    </div>
  );
};
