import { AppButton } from './ui/AppButton';

interface NavigationProps {
  currentStep: number;
  onPrevious: () => void;
  onNext: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  totalSteps: number;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  currentStep, 
  onPrevious, 
  onNext,
  isFirstStep,
  isLastStep,
  totalSteps
}) => {
  return (
    <div className="flex-shrink-0 pb-6 bg-gray-50 px-6">
      <div className="flex justify-between items-center">
        <AppButton
          onClick={onPrevious}
          disabled={isFirstStep}
          className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
        >
          <svg className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </AppButton>
        
        {/* Progress indicator */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 font-medium">
            Step {currentStep + 1} of {totalSteps}
          </span>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalSteps }, (_, idx) => (
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
        
        <AppButton
          onClick={onNext}
          disabled={isLastStep}
          gradient={isLastStep ? '#9ca3af' : 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)'}
        >
          {isLastStep ? 'Complete' : 'Next'}
          {!isLastStep && (
            <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </AppButton>
      </div>
    </div>
  );
};
