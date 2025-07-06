import React from 'react';

interface ProgressBarProps {
  value?: number | null; // 0-100 for determinate, undefined/null for indeterminate
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, className = '' }) => {
  // Clamp value between 0 and 100
  const percent = typeof value === 'number' ? Math.max(0, Math.min(100, value)) : undefined;

  return (
    <progress
      className={`progress progress-warning w-full ${className}`}
      value={typeof percent === 'number' ? percent : undefined}
      max={100}
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
    />
  );
}; 