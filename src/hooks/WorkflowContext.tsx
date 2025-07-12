import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useFileUpload } from './useFileUpload';
import { useEncoding } from './useEncoding';
import { useDecoding } from './useDecoding';
import { useScreenshotSearch } from './useScreenshotSearch';
import { usePsnrComparison, codecNames, codecColors } from './usePsnrComparison';
import { useToast } from './useToast';
import ToastContainer from '../components/ui/ToastContainer';
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

import { WorkflowContext } from './useWorkflow';
import type { StepConfig, StepGroup, StepSummary, WorkflowContextType } from './types';

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
  const encoding = useEncoding(fileUpload.uploadedFile?.name || '', fileUpload.uploadedFile?.size || 0, fileUpload.uploadedFile?.key);
  const decoding = useDecoding(fileUpload.uploadedFile?.key);
  const screenshotSearch = useScreenshotSearch(fileUpload.uploadedFile?.key);
  const toast = useToast();

  const psnrComparison = usePsnrComparison(fileUpload.uploadedFile?.key || '', fileUpload.uploadedFile?.duration);

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
            duration: encoding.encodingResult.datasetCreationTimeS,
            compressionRatio: encoding.encodingResult.compressionRatio,
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
          // Format duration as mm:ss
          const durationSec = summary.duration || 0;
          const mins = Math.floor(durationSec / 60);
          const secs = Math.floor(durationSec % 60);
          const formattedDuration = `${mins}:${secs.toString().padStart(2, '0')}`;
          // Format size as X.X MB
          let formattedSize = '--';
          if (typeof summary.size === 'string' && summary.size.includes('MB')) {
            formattedSize = summary.size;
          } else if (typeof summary.size === 'number') {
            formattedSize = `${(summary.size / (1024 * 1024)).toFixed(1)} MB`;
          }
          return (
            <>
              <SidebarStat icon={Clock} value={formattedDuration} className="bg-blue-50 text-blue-700" />
              <SidebarStat icon={HardDrive} value={formattedSize} className="bg-purple-50 text-purple-700" />
              <SidebarStat icon={Monitor} value={getResolutionLabel(summary.width, summary.height)} className="bg-green-50 text-green-700" />
            </>
          );
        case 'Encoding Finished':
          if (!summary.inputSize || !summary.outputSize || !summary.duration) return null;
          // Processing time (1 decimal)
          const processingTime = typeof summary.duration === 'number' ? `${summary.duration.toFixed(1)}s` : '--';
          // Compression ratio as X.Xx (to match main card)
          const ratio = summary.compression ?? summary.outputSize ? (summary.inputSize / summary.outputSize) : null;
          const compressionRatioStr = ratio ? `${ratio.toFixed(1)}x` : '--';
          // PSNR (1 decimal, dB) - if available
          const psnr = encoding.encodingResult?.psnr !== undefined ? `${encoding.encodingResult.psnr.toFixed(1)} dB` : '--';
          return (
            <>
              <SidebarStat icon={Clock} value={processingTime} className="bg-blue-50 text-blue-700" />
              <SidebarStat icon={HardDrive} value={compressionRatioStr} className="bg-purple-50 text-purple-700" />
              <SidebarStat icon={BarChart2} value={psnr} className="bg-yellow-50 text-yellow-700" />
            </>
          );
        case 'Decoding Finished':
          if (!summary.duration || !summary.psnr) return null;
          // Format duration as mm:ss
          const decMins = Math.floor(summary.duration / 60);
          const decSecs = Math.floor(summary.duration % 60);
          const formattedDecodingTime = `${decMins}:${decSecs.toString().padStart(2, '0')}`;
          // Format PSNR as X.X dB
          const formattedPsnr = `${summary.psnr.toFixed(1)} dB`;
          return (
            <>
              <SidebarStat icon={Clock} value={formattedDecodingTime} className="bg-blue-50 text-blue-700" />
              <SidebarStat icon={Signal} value={formattedPsnr} className="bg-yellow-50 text-yellow-700" />
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
        case 'Compare PSNR': {
          // Show a badge for each codec: {codec_name} {psnr_value} dB, with correct color
          if (!psnrComparison || !psnrComparison.psnrData) return null;
          return (
            <div className="flex flex-wrap gap-2">
              {Object.keys(codecNames).map((codec) => {
                const value = psnrComparison.psnrData[codec];
                const name = codecNames[codec] || codec;
                const color = codecColors[codec]?.bg || '#e5e7eb';
                const textColor = codecColors[codec]?.text || '#111827';
                const displayValue = typeof value === 'number' && isFinite(value) && value > 0 ? `${value.toFixed(1)} dB` : '--';
                return (
                  <span
                    key={codec}
                    style={{ backgroundColor: color, color: textColor, borderRadius: '0.5rem', padding: '0.25rem 0.75rem', fontWeight: 600, fontSize: 13 }}
                  >
                    {name} {displayValue}
                  </span>
                );
              })}
            </div>
          );
        }
        default:
          return null;
      }
    });
  }, [allSteps, stepSummaries, encoding.encodingResult, psnrComparison]);

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
  }, [allSteps, currentGroup.steps.length, currentGroupIndex, groupStartIndices]);

  const isFirstStep = useMemo(() => currentStep === 0, [currentStep]);
  const isLastStep = useMemo(() => currentStep === allSteps.length - 1, [currentStep, allSteps.length]);

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
    // Can't go to a future step if the current one isn't complete
    if (stepIndex > currentStep && !completedSteps.has(currentStep)) {
      return false;
    }
    return true;
  };

  const isStepCompleted = (stepIndex: number) => {
    return completedSteps.has(stepIndex);
  };

  const markStepAsCompleted = (stepIndex: number) => {
    setCompletedSteps(prev => new Set(prev).add(stepIndex));
  };

  const getStepSummary = (stepIndex: number): StepSummary | null => {
    return stepSummaries[stepIndex];
  };

  const getCurrentStepSummary = (): StepSummary | null => {
    return stepSummaries[currentStep];
  };

  const resetGroup = () => {
    const groupStart = groupStartIndices[currentGroupIndex];
    const groupEnd = groupStart + currentGroup.steps.length;
    
    setCompletedSteps(prev => {
      const newCompleted = new Set(prev);
      // Keep first step of group completed, remove others
      for (let i = groupStart + 1; i < groupEnd; i++) {
        newCompleted.delete(i);
      }
      return newCompleted;
    });

    setCurrentStep(groupStart);
  };

  const [shouldAutoAdvance, setShouldAutoAdvance] = useState(false);

  // Effect 1: Check conditions and set the flag
  useEffect(() => {
    const eta = decoding.decodingProgress?.eta;
    const decodingState = decoding.decodingState;

    if (
      currentStep < 4 &&
      decodingState === 'decoding' &&
      eta &&
      eta !== '' &&
      !shouldAutoAdvance
    ) {
      setShouldAutoAdvance(true);
    }
  }, [decoding.decodingState, decoding.decodingProgress?.eta, currentStep, shouldAutoAdvance]);

  // Effect 2: Trigger the auto-advance after a delay
  useEffect(() => {
    let timer: number | null = null;
    if (shouldAutoAdvance) {
      timer = setTimeout(() => {
        setCurrentStep(4); // Step5DecodedVideo is step index 4
      }, 5000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [shouldAutoAdvance]);
  
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
    resetGroup,
    fileUpload,
    encoding,
    decoding,
    screenshotSearch,
    psnrComparison,
    toast,
  };

  return (
    <WorkflowContext.Provider value={value}>
      {children}
      <ToastContainer />
    </WorkflowContext.Provider>
  );
}; 