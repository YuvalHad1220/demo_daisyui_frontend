import type { ReactNode } from 'react';
import type { useFileUpload } from './useFileUpload';
import type { useEncoding } from './useEncoding';
import type { useDecoding } from './useDecoding';
import type { useScreenshotSearch } from './useScreenshotSearch';
import type { usePsnrComparison } from './usePsnrComparison';
import type { useToast } from './useToast';

export interface StepConfig {
  label: string;
  icon: React.ElementType;
  component: React.ComponentType<any>; // Accepts any props
}

export interface StepGroup {
  label: string;
  steps: StepConfig[];
}

export interface StepSummary {
  name?: string;
  resolution?: string;
  size?: string;
  duration?: number;
  compression?: number;
  saved?: number;
  psnr?: number;
  frames?: number;
  count?: number;
  width?: number;
  height?: number;
  finished?: boolean;
  inputSize?: number;
  outputSize?: number;
}

export interface WorkflowContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  completedSteps: Set<number>;
  visitedSteps: Set<number>;
  workflowConfig: StepGroup[];
  allSteps: StepConfig[];
  stepSummaries: (StepSummary | null)[];
  stepMetadata: (React.ReactNode | null)[];
  currentGroup: StepGroup;
  currentGroupIndex: number;
  currentStepLabel: string;
  stepsInCurrentGroup: StepConfig[];
  groupStartIndices: number[];
  isFirstStep: boolean;
  isLastStep: boolean;
  goToStep: (stepIndex: number) => void;
  goToPrevious: () => void;
  goToNext: () => void;
  canGoToStep: (stepIndex: number) => boolean;
  isStepCompleted: (stepIndex: number) => boolean;
  isStepVisited: (stepIndex: number) => boolean;
  markStepAsCompleted: (stepIndex: number) => void;
  getStepSummary: (stepIndex: number) => StepSummary | null;
  getCurrentStepSummary: () => StepSummary | null;
  resetGroup: () => void;
  fileUpload: ReturnType<typeof useFileUpload>;
  encoding: ReturnType<typeof useEncoding>;
  decoding: ReturnType<typeof useDecoding>;
  screenshotSearch: ReturnType<typeof useScreenshotSearch>;
  psnrComparison: ReturnType<typeof usePsnrComparison>;
  toast: ReturnType<typeof useToast>;
} 