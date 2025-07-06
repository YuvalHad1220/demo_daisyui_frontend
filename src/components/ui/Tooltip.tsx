import React from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

// Map position prop to daisyUI tooltip classes
const getTooltipPositionClass = (position: string) => {
  switch (position) {
    case 'bottom':
      return 'tooltip-bottom';
    case 'left':
      return 'tooltip-left';
    case 'right':
      return 'tooltip-right';
    case 'top':
    default:
      return 'tooltip-top';
  }
};

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  className = ''
}) => {
  return (
    <span
      className={`tooltip ${getTooltipPositionClass(position)} ${className}`}
      data-tip={content}
      tabIndex={0}
      aria-label={content}
      style={{ zIndex: 50 }}
    >
      {children}
    </span>
  );
}; 