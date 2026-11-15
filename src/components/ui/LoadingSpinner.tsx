import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  label = 'Loading...',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div
      className={`flex flex-col items-center justify-center p-6 text-center ${className}`}
      role="status"
      aria-live="polite"
    >
      <div
        className={`${sizeClasses[size]} border-[#1B4332] border-t-transparent rounded-full animate-spin`}
        aria-hidden="true"
      />
      {label && (
        <p className="mt-3 text-sm font-medium text-[#475569]">{label}</p>
      )}
      <span className="sr-only">{label}</span>
    </div>
  );
};
