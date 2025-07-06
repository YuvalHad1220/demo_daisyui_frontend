import React, { createContext, useContext, useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useFileUpload } from './useFileUpload';
import { useEncoding } from './useEncoding';
import Step1FileUpload from '../steps/Step1FileUpload';
import Step2EncodingStarted from '../steps/Step2EncodingStarted';
import Step3EncodingFinished from '../steps/Step3EncodingFinished';
import Step4DecodingStarted from '../steps/Step4DecodingStarted';
import Step5DecodedVideo from '../steps/Step5DecodedVideo';
import Step6DecodingFinished from '../steps/Step6DecodingFinished';
import Step7ComparePSNR from '../steps/Step7ComparePSNR';
import Step8UploadScreenshots from '../steps/Step8UploadScreenshots';
import Step9ProcessImages from '../steps/Step9ProcessImages';
import Step10ShowTimestamps from '../steps/Step10ShowTimestamps';
import { Upload, Play, Zap, BarChart2, Video, Camera, CheckCircle, Image, Loader, BarChart3 } from 'lucide-react';

export interface StepConfig {
  label: string;
  icon: React.ElementType;
  component: React.ComponentType;
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
}

interface WorkflowContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  completedSteps: Set<number>;
  workflowConfig: StepGroup[];
  allSteps: StepConfig[];
  stepSummaries: (StepSummary | null)[];
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
  markStepAsCompleted: (stepIndex: number) => void;
  getStepSummary: (stepIndex: number) => StepSummary | null;
  getCurrentStepSummary: () => StepSummary | null;
  fileUpload: ReturnType<typeof useFileUpload>;
  encoding: ReturnType<typeof useEncoding>;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

export const WorkflowProvider = ({ children }: { children: ReactNode }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const fileUpload = useFileUpload();
  const encoding = useEncoding();

  const workflowConfig = useMemo((): StepGroup[] => [
    {
      label: 'File Upload',
      steps: [
        { label: 'File Upload', icon: Upload, component: Step1FileUpload },
      ],
    },
    {
      label: 'Encoding',
      steps: [
        { label: 'Encoding Started', icon: Play, component: Step2EncodingStarted },
        { label: 'Encoding Finished', icon: Zap, component: Step3EncodingFinished },
      ],
    },
    {
      label: 'Decoding',
      steps: [
        { label: 'Decoding Started', icon: BarChart2, component: Step4DecodingStarted },
        { label: 'Decoded Video', icon: Video, component: Step5DecodedVideo },
        { label: 'Decoding Finished', icon: CheckCircle, component: Step6DecodingFinished },
      ],
    },
    {
      label: 'Compare PSNR',
      steps: [
        { label: 'Compare PSNR', icon: BarChart3, component: Step7ComparePSNR },
      ],
    },
    {
      label: 'Screenshots',
      steps: [
        { label: 'Upload Screenshots', icon: Image, component: Step8UploadScreenshots },
        { label: 'Process Images', icon: Loader, component: Step9ProcessImages },
        { label: 'Show Timestamps', icon: Camera, component: Step10ShowTimestamps },
      ],
    },
  ], []);

  const { uploadedFile, finished } = fileUpload;
  const stepSummaries = useMemo((): (StepSummary | null)[] => {
    return [
      {
        name: uploadedFile?.name || '--',
        width: uploadedFile?.width,
        height: uploadedFile?.height,
        resolution: uploadedFile?.width && uploadedFile?.height ? `${uploadedFile.width}x${uploadedFile.height}` : '--',
        size: uploadedFile?.size ? `${(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB` : '--',
        duration: uploadedFile?.duration,
        finished,
      },
      null,
      {
        compression: 40,
        saved: 8.26,
        duration: 4.6,
      },
      null,
      null,
      {
        psnr: 38.2,
        duration: 60,
        frames: 1800,
      },
      null,
      null,
      {
        count: 4,
        duration: 2.12,
      },
      {
        count: 3,
      },
    ];
  }, [fileUpload.uploadedFile]);

  const allSteps = useMemo(() => workflowConfig.flatMap(group => group.steps), [workflowConfig]);

  const groupStartIndices = useMemo(() => {
    let idx = 0;
    return workflowConfig.map(group => {
      const start = idx;
      idx += group.steps.length;
      return start;
    });
  }, [workflowConfig]);

  const currentGroupIndex = useMemo(() => {
    let idx = 0;
    for (let i = 0; i < workflowConfig.length; i++) {
      if (currentStep < idx + workflowConfig[i].steps.length) return i;
      idx += workflowConfig[i].steps.length;
    }
    return workflowConfig.length - 1;
  }, [currentStep, workflowConfig]);

  const currentGroup = useMemo(() => workflowConfig[currentGroupIndex], [workflowConfig, currentGroupIndex]);

  const currentStepLabel = useMemo(() => allSteps[currentStep]?.label || '', [allSteps, currentStep]);

  const stepsInCurrentGroup = useMemo(() => {
    const groupStart = groupStartIndices[currentGroupIndex];
    const groupEnd = groupStart + currentGroup.steps.length;
    return allSteps.slice(groupStart, groupEnd);
  }, [allSteps, groupStartIndices, currentGroupIndex, currentGroup]);

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === allSteps.length - 1;

  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < allSteps.length) {
      setCurrentStep(stepIndex);
    }
  };

  const goToPrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToNext = () => {
    if (!isLastStep) {
      markStepAsCompleted(currentStep);
      setCurrentStep(currentStep + 1);
    }
  };

  const canGoToStep = (stepIndex: number) => {
    return stepIndex <= currentStep || completedSteps.has(stepIndex);
  };

  const isStepCompleted = (stepIndex: number) => {
    return completedSteps.has(stepIndex);
  };

  const markStepAsCompleted = (stepIndex: number) => {
    setCompletedSteps(prev => new Set([...prev, stepIndex]));
  };

  const getStepSummary = (stepIndex: number) => {
    return stepSummaries[stepIndex] || null;
  };

  const getCurrentStepSummary = () => {
    return getStepSummary(currentStep);
  };

  const value: WorkflowContextType = {
    currentStep,
    setCurrentStep,
    completedSteps,
    workflowConfig,
    allSteps,
    stepSummaries,
    currentGroup,
    currentGroupIndex,
    currentStepLabel,
    stepsInCurrentGroup,
    groupStartIndices,
    isFirstStep,
    isLastStep,
    goToStep,
    goToPrevious,
    goToNext,
    canGoToStep,
    isStepCompleted,
    markStepAsCompleted,
    getStepSummary,
    getCurrentStepSummary,
    fileUpload,
    encoding,
  };

  React.useEffect(() => {
    if (fileUpload.finished && !completedSteps.has(0)) {
      markStepAsCompleted(0);
    }
    
    if (encoding.encodingState === 'done') {
      if (!completedSteps.has(1)) markStepAsCompleted(1);
      if (!completedSteps.has(2)) markStepAsCompleted(2);
    }
  }, [fileUpload.finished, encoding.encodingState]);

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  );
};

export function useWorkflow() {
  const ctx = useContext(WorkflowContext);
  if (!ctx) throw new Error('useWorkflow must be used within a WorkflowProvider');
  return ctx;
} 