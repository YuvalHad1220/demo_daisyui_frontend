import { createContext, useContext } from 'react';
import type { WorkflowContextType } from './types';

export const WorkflowContext = createContext<
  WorkflowContextType | undefined
>(undefined);

export const useWorkflow = () => {
  const context = useContext(WorkflowContext);
  if (context === undefined) {
    // In development, HMR can cause this hook to be used outside the provider
    // temporarily. We can provide a fallback context to prevent a crash.
    if (import.meta.env.DEV) {
      console.warn(
        'useWorkflow must be used within a WorkflowProvider. This might be a temporary HMR issue.'
      );
      // Return a mock/fallback context
      return {
        currentStep: 0,
        totalSteps: 0,
        completedSteps: new Set(),
        currentGroupIndex: 0,
        currentGroup: { title: '', steps: [] },
        sidebarGroups: [],
        encoding: {},
        decoding: {},
        psnr: {},
        originalFile: {},
        decodedFile: {},
        setCurrentStep: () => {},
        goToNextStep: () => {},
        goToPrevStep: () => {},
        resetGroup: () => {},
        resetAll: () => {},
        isStepCompleted: () => false,
        isStepInProgress: () => false,
      } as WorkflowContextType;
    }
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
}; 