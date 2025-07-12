import React from 'react';
import { SidebarStepSummary } from '../SidebarStepSummary';
import type { StepGroup, StepSummary } from '../hooks/WorkflowContext';

interface SidebarProps {
  currentStep: number;
  onStepClick: (stepIndex: number) => void;
  canGoToStep: (stepIndex: number) => boolean;
  isStepCompleted: (stepIndex: number) => boolean;
  isStepVisited: (stepIndex: number) => boolean;
  workflowConfig: StepGroup[];
  stepSummaries: (StepSummary | null)[];
  stepMetadata: (React.ReactNode | null)[];
  groupStartIndices: number[];
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentStep, 
  onStepClick,
  canGoToStep,
  isStepCompleted,
  isStepVisited,
  workflowConfig,
  stepSummaries,
  stepMetadata,
  groupStartIndices
}) => {
  return (
    <aside className="w-72 border-r border-gray-200 bg-white flex flex-col py-8 px-4">
      <div className="mb-8 pl-2">
        <span className="text-xl font-bold text-gray-900 tracking-tight">Demo Flow</span>
      </div>
      <nav className="flex flex-col gap-6 w-full">
        {workflowConfig.map((group, groupIdx) => (
          <div key={group.label} className="w-full">
            {/* Show divider before group title (except for first group) */}
            {groupIdx > 0 && (
              <div className="mb-4">
                <div className="h-px bg-gray-200 mx-2" />
              </div>
            )}
            <div className="text-sm font-semibold text-gray-700 mb-3 px-2">{group.label}</div>
            <div className="flex flex-col gap-1">
              {group.steps.map((step, idx) => {
                const stepIdx = groupStartIndices[groupIdx] + idx;
                const isClickable = canGoToStep(stepIdx);
                return (
                  <div 
                    key={step.label} 
                    onClick={() => isClickable && onStepClick(stepIdx)} 
                    style={{ cursor: isClickable ? 'pointer' : 'not-allowed' }}
                  >
                    <SidebarStepSummary
                      stepIndex={stepIdx}
                      currentStep={currentStep}
                      stepLabel={step.label}
                      icon={step.icon}
                      isStepCompleted={isStepCompleted}
                      isStepVisited={isStepVisited}
                      metadata={stepMetadata[stepIdx]}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}; 