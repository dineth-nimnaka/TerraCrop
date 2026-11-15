import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  className = '',
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeClasses = {
    sm: 'min-h-[40px] px-3 py-1.5 text-sm',
    md: 'min-h-[48px] px-5 py-2.5 text-base', // 48px touch target
    lg: 'min-h-[52px] px-6 py-3 text-lg',
  };

  const variantClasses = {
    primary:
      'bg-[#1B4332] text-white hover:bg-[#2D6A4F] focus:ring-[#1B4332]',
    secondary:
      'bg-[#E0F2FE] text-[#0369A1] hover:bg-[#BAE6FD] focus:ring-[#0284C7]',
    outline:
      'border-2 border-[#1B4332] text-[#1B4332] bg-transparent hover:bg-[#F3F7F4] focus:ring-[#1B4332]',
    danger:
      'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600',
    ghost:
      'text-[#475569] hover:bg-slate-100 hover:text-[#0F172A] focus:ring-slate-300',
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center space-x-2">
          <svg
            className="w-5 h-5 animate-spin text-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          <span>Loading...</span>
        </span>
      ) : (
        <span className="flex items-center space-x-2">
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <span>{children}</span>
        </span>
      )}
    </button>
  );
};
