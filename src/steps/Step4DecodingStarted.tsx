import React from 'react';
import { Play, RotateCcw, AlertCircle, Check } from 'lucide-react';
import { StageCard } from '../components/ui/StageCard';
import { AppButton } from '../components/ui/AppButton';
import { useWorkflow } from '../hooks/useWorkflow';

const Step4DecodingStarted: React.FC = () => {
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
  };

  return (
    <StageCard
      title="Video Decoding & Playback"
      icon={Play}
      showReset={decodingState === 'done'}
      resetTitle="Reset Video"
      onResetClick={handleReset}
    >
      {/* Main Content */}
      <div className="flex flex-col items-center py-8 px-6 flex-1 justify-center">
        {decodingState === 'initial' && (
          <>
            <AppButton icon={<Play className="w-5 h-5" />} onClick={handleStartDecoding}>
              Start Decoding
            </AppButton>
            <p className="text-sm mt-4" style={{ color: '#6b7280' }}>
              Click to begin decoding your video. This may take a few moments.
            </p>
          </>
        )}

        {decodingState === 'decoding' && (
          <>
            <div className="flex flex-col items-center mb-6">
              <div className="w-14 h-14 flex items-center justify-center rounded-full mb-4" style={{ background: 'rgba(245,158,66,0.08)' }}>
                <svg className="animate-spin" width="32" height="32" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="#f59e42" strokeWidth="4" fill="none" opacity="0.2" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="#f59e42" strokeWidth="4" fill="none" strokeLinecap="round" />
                </svg>
              </div>
              <div className="font-semibold text-xl" style={{ color: '#111827' }}>Decoding Video Stream</div>
            </div>
            <div className="w-full">
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div
                  className="h-3 rounded-full transition-all duration-300"
                  style={{
                    background: 'linear-gradient(90deg, #f59e42 0%, #f97316 100%)',
                    width: `${decodingProgress.progress}%`
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-xs text-gray-500 mb-1">Progress</div>
                  <div className="text-xl font-bold" style={{ color: '#f59e42' }}>{Math.round(decodingProgress.progress)}%</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-xs text-gray-500 mb-1">ETA</div>
                  <div className="text-xl font-bold" style={{ color: '#2563eb' }}>{decodingProgress.eta}</div>
                </div>
              </div>
            </div>
          </>
        )}

        {decodingState === 'error' && (
          <div className="space-y-4 animate-shake w-full">
            <div className="flex items-start space-x-3 p-4 rounded-lg border" style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#fee2e2' }}>
                <AlertCircle className="w-4 h-4" style={{ color: '#ef4444' }} />
              </div>
              <div>
                <p className="font-semibold" style={{ color: '#dc2626' }}>Decoding Failed</p>
                <p className="text-sm" style={{ color: '#991b1b' }}>{decodingError}</p>
              </div>
            </div>
            <AppButton onClick={handleRetry} className="w-full" style={{ color: '#374151', background: '#f3f4f6', border: '1px solid #d1d5db' }}>
              Try Again
            </AppButton>
          </div>
        )}

        {decodingState === 'done' && (
          <div className="flex flex-col items-center space-y-4 animate-fade-in">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f0fdf4' }}>
              <Check className="w-6 h-6" style={{ color: '#22c55e' }} />
            </div>
            <p className="text-lg font-semibold" style={{ color: '#22c55e' }}>
              Decoding Complete!
            </p>
            <p className="text-sm" style={{ color: '#6b7280' }}>
              Your video has been successfully decoded and is ready for playback.
            </p>
          </div>
        )}
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </StageCard>
  );
};

export default Step4DecodingStarted; 