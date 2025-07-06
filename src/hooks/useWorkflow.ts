import { useState, useMemo } from 'react';
import { Upload, Play, Zap, BarChart2, Video, Camera, CheckCircle, Image, Loader, BarChart3 } from 'lucide-react';
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
}

export const useWorkflow = () => {
  const [currentStep, setCurrentStep] = useState(0);

  // Workflow configuration
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

  // Step summaries data
  const stepSummaries = useMemo((): (StepSummary | null)[] => [
    {
      name: 'myvideo.mp4',
      resolution: 'FHD',
      size: '28.3 MB',
      duration: 90,
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
  ], []);

  // Computed values
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

  // Navigation helpers
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
      setCurrentStep(currentStep + 1);
    }
  };

  const canGoToStep = (stepIndex: number) => {
    return stepIndex <= currentStep;
  };

  // Step metadata helpers
  const getStepSummary = (stepIndex: number) => {
    return stepSummaries[stepIndex] || null;
  };

  const getCurrentStepSummary = () => {
    return getStepSummary(currentStep);
  };

  return {
    // State
    currentStep,
    setCurrentStep,
    
    // Configuration
    workflowConfig,
    allSteps,
    stepSummaries,
    
    // Computed values
    currentGroup,
    currentGroupIndex,
    currentStepLabel,
    stepsInCurrentGroup,
    groupStartIndices,
    
    // Navigation state
    isFirstStep,
    isLastStep,
    
    // Navigation actions
    goToStep,
    goToPrevious,
    goToNext,
    canGoToStep,
    
    // Metadata helpers
    getStepSummary,
    getCurrentStepSummary,
  };
}; 