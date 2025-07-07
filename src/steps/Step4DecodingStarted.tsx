import React from 'react';
import { Play } from 'lucide-react';
import { StageCard } from '../components/ui/StageCard';
import { useWorkflow } from '../hooks/WorkflowContext';
import DecodingInitialState from './step4DecodingStarted/DecodingInitialState';
import DecodingInProgress from './step4DecodingStarted/DecodingInProgress';
import DecodingErrorState from './step4DecodingStarted/DecodingErrorState';
import DecodingDoneState from './step4DecodingStarted/DecodingDoneState';

const Step4DecodingStarted: React.FC<{ onResetGroup: () => void; isFirstStepInGroup: boolean }> = ({ onResetGroup, isFirstStepInGroup }) => {
  const { decoding } = useWorkflow();
  const {
    decodingState,
    decodingError,
    decodingProgress,
    startDecode,
    resetDecode
  } = decoding;

  const handleStartDecoding = () => {
    startDecode();
  };

  const handleRetry = () => {
    startDecode();
  };

  const handleReset = () => {
    resetDecode();
    onResetGroup();
  };

  return (
    <StageCard
      title="Video Decoding & Playback"
      icon={Play}
      showReset={isFirstStepInGroup}
      resetTitle="Reset Video"
      onResetClick={handleReset}
    >
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        {decodingState === 'initial' && (
          <DecodingInitialState onStartDecoding={handleStartDecoding} />
        )}
        {decodingState === 'decoding' && (
          <DecodingInProgress
            progress={decodingProgress.progress}
            eta={decodingProgress.eta}
            currentFrame={decodingProgress.currentFrame}
            totalFrames={decodingProgress.totalFrames}
          />
        )}
        {decodingState === 'error' && (
          <DecodingErrorState decodingError={decodingError} onRetry={handleRetry} />
        )}
        {decodingState === 'done' && (
          <DecodingDoneState />
        )}
      </div>
    </StageCard>
  );
};

export default Step4DecodingStarted; 