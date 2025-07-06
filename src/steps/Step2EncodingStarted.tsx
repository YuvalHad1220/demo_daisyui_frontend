import React from 'react';
import { Play, AlertCircle, Check } from 'lucide-react';
import { StageCard } from '../components/ui/StageCard';
import { useWorkflow } from '../hooks/useWorkflow';

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
            <button
              onClick={handleStartEncoding}
              className="px-8 py-3 rounded-lg font-semibold text-white flex items-center space-x-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
              style={{ 
                background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
                boxShadow: '0 4px 6px -1px rgba(20, 184, 166, 0.1)'
              }}
            >
              <Play className="w-5 h-5" />
              <span>Start Encoding</span>
            </button>
            <p className="text-sm" style={{ color: '#6b7280' }}>
              Click to begin encoding your video. This may take a few moments.
            </p>
          </div>
        )}
        {encodingState === 'encoding' && (
          <div className="flex flex-col items-center space-y-6 animate-fade-in">
            <div className="flex flex-col items-center mb-2">
              <div className="w-14 h-14 flex items-center justify-center rounded-full mb-4" style={{ background: 'rgba(245,158,66,0.08)' }}>
                <svg className="animate-spin" width="32" height="32" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="#f59e42" strokeWidth="4" fill="none" opacity="0.2" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="#f59e42" strokeWidth="4" fill="none" strokeLinecap="round" />
                </svg>
              </div>
              <span className="font-semibold text-xl" style={{ color: '#111827' }}>Encoding Video</span>
            </div>
            <p className="text-sm font-medium" style={{ color: '#6b7280' }}>
              Please wait while your video is being encoded.
            </p>
          </div>
        )}
        {encodingState === 'error' && (
          <div className="space-y-4 animate-shake">
            <div className="flex items-start space-x-3 p-4 rounded-lg border" style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#fee2e2' }}>
                <AlertCircle className="w-4 h-4" style={{ color: '#ef4444' }} />
              </div>
              <div>
                <p className="font-semibold" style={{ color: '#dc2626' }}>Encoding Failed</p>
                <p className="text-sm" style={{ color: '#991b1b' }}>{encodingError}</p>
              </div>
            </div>
            <button
              onClick={handleRetry}
              className="w-full px-4 py-3 border rounded-lg text-sm font-semibold transition-colors hover:bg-gray-50"
              style={{ color: '#374151', borderColor: '#d1d5db' }}
            >
              Try Again
            </button>
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