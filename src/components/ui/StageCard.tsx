import React from 'react';
import { RotateCcw } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface StageCardProps {
  title: string;
  icon?: React.ElementType;
  showReset?: boolean;
  resetTitle?: string;
  onResetClick?: () => void;
  resetting?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const StageCard: React.FC<StageCardProps> = ({
  title,
  icon: Icon,
  showReset = false,
  resetTitle = 'Reset',
  onResetClick,
  resetting = false,
  children,
  className = ''
}) => {
  return (
    <div className={`w-full h-full p-6 ${className}`}>
      <div 
        className="bg-white rounded-xl border shadow-sm h-full flex flex-col" 
        style={{ borderColor: '#e5e7eb' }}
      >
        {/* Header */}
        <div 
          className="px-6 py-4 border-b flex items-center justify-between" 
          style={{ borderColor: '#e5e7eb' }}
        >
          <div className="flex items-center space-x-3">
            {Icon && (
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center" 
                style={{ backgroundColor: '#f0fdfa' }}
              >
                <Icon className="w-4 h-4" style={{ color: '#14b8a6' }} />
              </div>
            )}
            <h2 className="text-lg font-semibold" style={{ color: '#111827' }}>
              {title}
            </h2>
          </div>
          
          {showReset && onResetClick && (
            <Tooltip content={resetTitle} position="top">
              <button
                onClick={onResetClick}
                className="flex items-center justify-center w-8 h-8 rounded-lg border transition-colors hover:bg-gray-50"
                style={{ color: '#6b7280', borderColor: '#d1d5db' }}
                disabled={resetting}
              >
                {resetting ? (
                  <RotateCcw className="w-4 h-4 animate-spin" />
                ) : (
                  <RotateCcw className="w-4 h-4" />
                )}
              </button>
            </Tooltip>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
}; 