import React from 'react';
import clsx from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  actions?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className, title, actions }) => {
  return (
    <div
      className={clsx(
        'bg-light-bg-primary dark:bg-dark-bg-primary',
        'border border-light-border dark:border-dark-border',
        'rounded-card shadow-soft',
        'p-6',
        className
      )}
    >
      {(title || actions) && (
        <div className="flex items-center justify-between mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">
              {title}
            </h3>
          )}
          {actions && <div>{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
