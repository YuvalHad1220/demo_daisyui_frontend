import React from 'react';
import { Play, Check } from 'lucide-react';
import { ErrorAlert } from '../components/ui/ErrorAlert';
import { StageCard } from '../components/ui/StageCard';
import LoadingCircular from '../components/ui/LoadingCircular';
import { useWorkflow } from '../hooks/WorkflowContext';
import { AppButton } from '../components/ui/AppButton';

const Step2EncodingStarted: React.FC = () => {
  const { encoding } = useWorkflow();
  const {
    encodingState,
    encodingError,
    startEncode,
    pollEncode, // not used in UI, but available
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
    setResetting(false);
  };

  return (
    <StageCard
      title="Encoding"
      icon={Play}
      showReset={encodingState === 'done'}
      resetTitle="Reset Encoding"
      onResetClick={handleReset}
      resetting={resetting}
    >
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        {encodingState === 'initial' && (
          <div className="flex flex-col items-center space-y-6 animate-fade-in">
            <AppButton icon={<Play className="w-5 h-5" />} onClick={handleStartEncoding}>
              Start Encoding
            </AppButton>
            <p className="text-sm" style={{ color: '#6b7280' }}>
              Click to begin encoding your video. This may take a few moments.
            </p>
          </div>
        )}
        {encodingState === 'encoding' && (
          <div className="flex flex-col items-center space-y-6 animate-fade-in">
            <div className="flex flex-col items-center mb-2">
              <LoadingCircular size="md" className="mb-4" />
              <span className="font-semibold text-xl" style={{ color: '#111827' }}>Encoding Video</span>
            </div>
            <p className="text-sm font-medium" style={{ color: '#6b7280' }}>
              Please wait while your video is being encoded.
            </p>
          </div>
        )}
        {encodingState === 'error' && (
          <div className="space-y-4 animate-shake">
            <ErrorAlert title="Encoding Failed" message={encodingError} />
            <AppButton onClick={handleRetry} className="w-full" style={{ color: '#374151', background: '#f3f4f6', border: '1px solid #d1d5db' }}>
              Try Again
            </AppButton>
          </div>
        )}
        {encodingState === 'done' && (
          <div className="flex flex-col items-center space-y-4 animate-fade-in">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f0fdf4' }}>
              <Check className="w-6 h-6" style={{ color: '#22c55e' }} />
            </div>
            <p className="text-lg font-semibold" style={{ color: '#22c55e' }}>
              Encoding Complete!
            </p>
            <p className="text-sm" style={{ color: '#6b7280' }}>
              Your video has been successfully encoded.
            </p>
          </div>
        )}
      </div>
    </StageCard>
  );
};

export default Step2EncodingStarted; 