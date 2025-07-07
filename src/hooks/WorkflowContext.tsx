import React, { createContext, useContext, useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useFileUpload } from './useFileUpload';
import { useEncoding } from './useEncoding';
import { useDecoding } from './useDecoding';
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
import { SidebarStat } from '../components/ui/SidebarStat';
import { Upload, Play, Zap, BarChart2, Video, Camera, CheckCircle, Image, Loader, BarChart3, Monitor, HardDrive, Clock, TrendingDown, Hash, Signal, FileText } from 'lucide-react';

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
  markStepAsCompleted: (stepIndex: number) => void;
  getStepSummary: (stepIndex: number) => StepSummary | null;
  getCurrentStepSummary: () => StepSummary | null;
  fileUpload: ReturnType<typeof useFileUpload>;
  encoding: ReturnType<typeof useEncoding>;
  decoding: ReturnType<typeof useDecoding>;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

function getResolutionLabel(width?: number, height?: number): string {
  if (!width || !height) return '--';
  if (width === 7680 && height === 4320) return '8K UHD';
  if (width === 3840 && height === 2160) return '4K UHD';
  if (width === 2560 && height === 1440) return '2K QHD';
  if (width === 1920 && height === 1080) return 'FHD';
  if (width === 1280 && height === 720) return 'HD';
  return `${width}x${height}`;
}

export const WorkflowProvider = ({ children }: { children: ReactNode }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const fileUpload = useFileUpload();
  const encoding = useEncoding();
  const decoding = useDecoding();

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
      encoding.encodingState === 'done' && encoding.encodingResult
        ? {
            outputSize: encoding.encodingResult.outputSize,
            inputSize: encoding.encodingResult.inputSize,
            duration: encoding.encodingResult.duration,
            finished: true,
          } as StepSummary
        : null,
      null,
      null,
      decoding.decodingState === 'done' && decoding.decodingResult
        ? {
            psnr: decoding.decodingResult.psnr,
            duration: decoding.decodingResult.duration,
            frames: decoding.decodingResult.frameCount,
            finished: true,
          } as StepSummary
        : null,
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
  }, [fileUpload.uploadedFile, finished, encoding.encodingState, encoding.encodingResult, decoding.decodingState, decoding.decodingResult]);

  const allSteps = useMemo(() => workflowConfig.flatMap(group => group.steps), [workflowConfig]);

  const stepMetadata = useMemo((): (React.ReactNode | null)[] => {
    return allSteps.map((step, index) => {
      const summary = stepSummaries[index];
      if (!summary || !summary.finished) return null;

      switch (step.label) {
        case 'File Upload':
          return (
            <>
              <SidebarStat icon={Monitor} value={getResolutionLabel(summary.width, summary.height)} className="bg-green-50 text-green-700" />
              <SidebarStat icon={HardDrive} value={summary.size} className="bg-purple-50 text-purple-700" />
              <SidebarStat icon={Clock} value={`${summary.duration}s`} className="bg-blue-50 text-blue-700" />
            </>
          );
        case 'Encoding Finished':
          if (!summary.inputSize || !summary.outputSize || !summary.duration) return null;
          const compression = Math.round(((summary.inputSize - summary.outputSize) / summary.inputSize) * 100);
          return (
            <>
              <SidebarStat icon={Clock} value={`${summary.duration}s`} className="bg-blue-50 text-blue-700" />
              <SidebarStat icon={TrendingDown} value={`~${compression}%`} className="bg-teal-50 text-teal-700" />
              <SidebarStat icon={BarChart2} value={`${summary.outputSize.toFixed(2)}MB`} className="bg-purple-50 text-purple-700" />
            </>
          );
        case 'Decoding Finished':
          if (!summary.duration || !summary.frames || !summary.psnr) return null;
          return (
            <>
              <SidebarStat icon={Clock} value={`${summary.duration}s`} className="bg-blue-50 text-blue-700" />
              <SidebarStat icon={Hash} value={`${summary.frames}f`} className="bg-orange-50 text-orange-600" />
              <SidebarStat icon={Signal} value={`${summary.psnr}dB`} className="bg-yellow-50 text-yellow-700" />
            </>
          );
        case 'Process Images':
          return (
            <SidebarStat icon={Image} value={`${summary.count} images`} className="bg-teal-50 text-teal-700" />
          );
        case 'Show Timestamps':
          return (
            <SidebarStat icon={FileText} value={`${summary.count} screenshots`} className="bg-teal-50 text-teal-700" />
          );
        default:
          return null;
      }
    });
  }, [allSteps, stepSummaries]);

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

  // Auto-mark steps as completed based on their state
  React.useEffect(() => {
    // Mark file upload as completed if it's finished
    if (fileUpload.finished && !completedSteps.has(0)) {
      markStepAsCompleted(0);
    }
    
    // Mark encoding steps as completed if encoding is done
    if (encoding.encodingState === 'done') {
      if (!completedSteps.has(1)) markStepAsCompleted(1); // Encoding Started
      if (!completedSteps.has(2)) markStepAsCompleted(2); // Encoding Finished
    }

    // Mark decoding steps as completed if decoding is done
    if (decoding.decodingState === 'done') {
      if (!completedSteps.has(3)) markStepAsCompleted(3); // Decoding Started
      if (!completedSteps.has(4)) markStepAsCompleted(4); // Decoded Video
      if (!completedSteps.has(5)) markStepAsCompleted(5); // Decoding Finished
    }
  }, [fileUpload.finished, encoding.encodingState, decoding.decodingState]);

  const value: WorkflowContextType = {
    currentStep,
    setCurrentStep,
    completedSteps,
    workflowConfig,
    allSteps,
    stepSummaries,
    stepMetadata,
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
    decoding,
  };

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