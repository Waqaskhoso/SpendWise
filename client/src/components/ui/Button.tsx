import React from 'react';
import clsx from 'clsx';
import { LoadingSpinner } from './LoadingSpinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 active:bg-indigo-800':
            variant === 'primary',
          'bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-400 dark:bg-dark-700 dark:text-slate-200 dark:hover:bg-dark-600':
            variant === 'secondary',
          'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 active:bg-red-800':
            variant === 'danger',
          'bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-400 dark:text-slate-300 dark:hover:bg-dark-700':
            variant === 'ghost',
          'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:ring-indigo-500 dark:border-dark-600 dark:bg-dark-800 dark:text-slate-200 dark:hover:bg-dark-700':
            variant === 'outline',
          'px-2.5 py-1.5 text-sm': size === 'sm',
          'px-4 py-2 text-sm': size === 'md',
          'px-6 py-3 text-base': size === 'lg',
        },
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <LoadingSpinner size="sm" /> : icon}
      {children}
    </button>
  );
}
