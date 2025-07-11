import React from 'react';

interface SidebarStepSummaryProps {
  stepIndex: number;
  currentStep: number;
  stepLabel: string;
  icon: React.ElementType;
  isStepCompleted: (stepIndex: number) => boolean;
  isStepVisited: (stepIndex: number) => boolean;
  metadata: React.ReactNode;
}



export const SidebarStepSummary: React.FC<SidebarStepSummaryProps> = ({ 
  stepIndex, 
  currentStep, 
  stepLabel, 
  icon: Icon,
  isStepCompleted,
  isStepVisited,
  metadata
}) => {
  const isCompleted = isStepCompleted(stepIndex);
  const isVisited = isStepVisited(stepIndex);
  const isCurrent = stepIndex === currentStep;
  const isFuture = stepIndex > currentStep;

  return (
      <div
        className={`flex flex-col px-3 py-2.5 mx-1 my-0.5 h-auto rounded-lg border transition-all duration-200 group hover:scale-[1.01]
          ${isCurrent 
            ? 'border-teal-200 bg-teal-50 shadow-sm cursor-pointer' 
            : isCompleted 
              ? 'border-gray-200 bg-white hover:bg-gray-50 hover:shadow-sm hover:border-gray-300 cursor-pointer' 
              : isVisited 
                ? 'border-gray-200 bg-white hover:bg-gray-50 hover:shadow-sm hover:border-gray-300 cursor-pointer' 
                : 'border-gray-100 bg-gray-50/50 cursor-not-allowed'
          }
        `}
      >
        <div className="flex items-center">
          {/* Icon Container - using README color guidelines */}
          <div className="flex items-center justify-center w-7 h-7 mr-3 flex-shrink-0">
            {isCompleted ? (
              <div 
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-[1.02]"
                style={{ 
                  backgroundColor: '#dcfce7',
                  border: '1px solid #bbf7d0'
                }}
              >
                <Icon className="w-4 h-4 text-green-600" />
              </div>
            ) : (
              <div 
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-[1.02] ${isCurrent ? '' : 'border'} ${
                  isCurrent 
                    ? 'border-teal-600' 
                    : isVisited 
                      ? ''
                      : isFuture 
                        ? 'bg-gray-100 border-gray-200'
                        : 'bg-gray-50 border-gray-200'
                }`}
                style={{
                  backgroundColor: isCurrent ? '#14b8a6' : isVisited ? '#dcfce7' : undefined,
                  border: isVisited ? '1px solid #bbf7d0' : undefined
                }}
              >
                <Icon 
                  className={`w-4 h-4 ${
                    isCurrent 
                      ? 'text-white' 
                      : isVisited
                        ? 'text-green-600'
                      : isFuture 
                          ? 'text-gray-400' 
                          : 'text-gray-500' 
                  }`}
                />
              </div>
            )}
          </div>
          
          {/* Content - improved typography hierarchy with fixed height */}
          <div className="flex-1 min-w-0 h-full flex flex-col justify-center overflow-hidden">
            <div 
              className={`truncate text-sm font-semibold transition-colors duration-200 ${
                isCurrent 
                  ? 'text-gray-900' 
                  : isCompleted 
                    ? 'text-gray-700 group-hover:text-gray-900' 
                    : isVisited 
                      ? 'text-gray-700 group-hover:text-gray-900'
                      : 'text-gray-500'
              }`}
            >
              {stepLabel}
            </div>
            {isCompleted && metadata && (
              <div className="flex items-center gap-1 mt-0.5 overflow-hidden">
                {metadata}
              </div>
            )}
          </div>
        </div>
      </div>
  );
};

export default SidebarStepSummary; 