import React from 'react';
import clsx from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'green' | 'red' | 'blue' | 'yellow' | 'purple' | 'gray';
  size?: 'sm' | 'md';
}

export function Badge({ children, variant = 'gray', size = 'sm' }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full',
        {
          'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400': variant === 'green',
          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400': variant === 'red',
          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400': variant === 'blue',
          'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400': variant === 'yellow',
          'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400': variant === 'purple',
          'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300': variant === 'gray',
          'px-2 py-0.5 text-xs': size === 'sm',
          'px-2.5 py-1 text-sm': size === 'md',
        }
      )}
    >
      {children}
    </span>
  );
}
