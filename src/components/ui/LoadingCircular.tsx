import React from 'react';

interface LoadingCircularProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LoadingCircular: React.FC<LoadingCircularProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-14 h-14',
    lg: 'w-20 h-20'
  };

  const svgSizes = {
    sm: 20,
    md: 32,
    lg: 40
  };

  return (
    <div className={`flex items-center justify-center rounded-full bg-warning/10 ${sizeClasses[size]} ${className}`}>
      <svg className="animate-spin text-warning" width={svgSizes[size]} height={svgSizes[size]} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.2" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
};

export default LoadingCircular; 