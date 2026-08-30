import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverable = false,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'bg-surface rounded-xl border border-border overflow-hidden transition-all duration-200',
          hoverable ? 'hover:shadow-card-hover hover:border-brand/30 cursor-pointer' : 'shadow-card',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
