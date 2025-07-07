import React from 'react';
import { Play } from 'lucide-react';
import { StageCard } from '../components/ui/StageCard';
import { useWorkflow } from '../hooks/WorkflowContext';
import EncodingInitialState from './Step2EncodingStarted/EncodingInitialState';
import EncodingInProgress from './Step2EncodingStarted/EncodingInProgress';
import EncodingErrorState from './Step2EncodingStarted/EncodingErrorState';
import EncodingDoneState from './Step2EncodingStarted/EncodingDoneState';

const Step2EncodingStarted: React.FC<{ onResetGroup: () => void; isFirstStepInGroup: boolean }> = ({ onResetGroup, isFirstStepInGroup }) => {
  const { encoding } = useWorkflow();
  const {
    encodingState,
    encodingError,
    startEncode,
    resetEncode,
  } = encoding;
  const [resetting, setResetting] = React.useState(false);

  const handleStartEncoding = async () => {
    await startEncode();
  };

  const handleRetry = async () => {
    await resetEncode();
  };

  const handleReset = async () => {
    setResetting(true);
    await resetEncode();
    onResetGroup();
    setResetting(false);
  };

  return (
    <StageCard
      title="Encoding"
      icon={Play}
      showReset={isFirstStepInGroup}
      resetTitle="Reset Encoding"
      onResetClick={handleReset}
      resetting={resetting}
    >
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        {encodingState === 'initial' && (
          <EncodingInitialState onStartEncoding={handleStartEncoding} />
        )}
        {encodingState === 'encoding' && (
          <EncodingInProgress />
        )}
        {encodingState === 'error' && (
          <EncodingErrorState encodingError={encodingError} onRetry={handleRetry} />
        )}
        {encodingState === 'done' && (
          <EncodingDoneState />
        )}
      </div>
    </StageCard>
  );
};

export default Step2EncodingStarted; 