import React from 'react';
import type { StepConfig } from '../hooks/WorkflowContext';

interface MainContentProps {
  currentStep: number;
  currentGroup: { label: string; steps: StepConfig[] };
  currentStepLabel: string;
  stepsInCurrentGroup: StepConfig[];
  groupStartIndices: number[];
  currentGroupIndex: number;
}

export const MainContent: React.FC<MainContentProps> = ({ 
  currentStep,
  currentGroup,
  currentStepLabel,
  stepsInCurrentGroup,
  groupStartIndices,
  currentGroupIndex
}) => {
  const groupStart = groupStartIndices[currentGroupIndex];

  return (
    <main className="flex-1 flex flex-col px-6 py-8">
      <header className="mb-8 border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">{currentGroup.label}</h1>
        <p className="text-gray-500 text-sm mt-1">{currentStepLabel}</p>
      </header>
      <section className="flex-1 flex flex-row items-center justify-center gap-2 overflow-x-auto">
        {stepsInCurrentGroup.map((step, indexInGroup) => {
          const stepIdx = groupStart + indexInGroup;
          const isCompleted = stepIdx < currentStep;
          const isCurrent = stepIdx === currentStep;
          const isFuture = stepIdx > currentStep;
          
          // Don't show future steps
          if (isFuture) return null;
          
          const StepComponent = step.component;
          return (
            <div 
              key={step.label} 
              className={`${
                isCurrent 
                  ? 'flex-1' 
                  : 'w-140 flex-shrink-0'
              } h-full min-w-0 relative transition-all duration-300`}
            >
              {/* Step content with reduced opacity for completed steps */}
              <div className={`h-full ${isCompleted ? 'opacity-75 hover:opacity-90' : ''} transition-opacity duration-200`}>
                <StepComponent />
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}; 