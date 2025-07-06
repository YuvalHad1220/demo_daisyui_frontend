import React from 'react';
import { useWorkflow } from '../hooks/useWorkflow';

interface NavigationProps {
  currentStep: number;
  onPrevious: () => void;
  onNext: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  currentStep, 
  onPrevious, 
  onNext 
}) => {
  const { allSteps, isFirstStep, isLastStep } = useWorkflow();

  return (
    <div className="flex-shrink-0 pt-6">
      <div className="flex justify-between items-center">
        <button
          className="group flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-sm"
          onClick={onPrevious}
          disabled={isFirstStep}
        >
          <svg className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>
        
        {/* Progress indicator */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 font-medium">
            Step {currentStep + 1} of {allSteps.length}
          </span>
          <div className="flex items-center gap-1">
            {allSteps.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  idx < currentStep
                    ? 'bg-green-500'
                    : idx === currentStep
                    ? 'bg-teal-500 scale-125'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
        
        <button
          className="group flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white bg-teal-500 hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
          onClick={onNext}
          disabled={isLastStep}
          style={{
            background: isLastStep 
              ? '#9ca3af' 
              : 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
            boxShadow: isLastStep 
              ? 'none' 
              : '0 4px 6px -1px rgba(20, 184, 166, 0.15)'
          }}
        >
          {isLastStep ? 'Complete' : 'Next'}
          {!isLastStep && (
            <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}; 