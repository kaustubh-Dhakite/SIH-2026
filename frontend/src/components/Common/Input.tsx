import React from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-1">
          {label}
        </label>
      )}
      <input
        className={clsx(
          'w-full px-3 py-2 rounded-lg border',
          'bg-light-bg-primary dark:bg-dark-bg-primary',
          'text-light-text-primary dark:text-dark-text-primary',
          'border-light-border dark:border-dark-border',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
          'placeholder-light-text-secondary dark:placeholder-dark-text-secondary',
          error && 'border-error focus:ring-error',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-error">{error}</p>
      )}
    </div>
  );
};
