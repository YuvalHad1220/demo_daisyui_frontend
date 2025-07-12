import React from 'react';
import LoadingCircular from '../../components/ui/LoadingCircular';

interface EncodingInProgressProps {
  progress: number | string;
  eta: string | null;
}

const EncodingInProgress: React.FC<EncodingInProgressProps> = ({ progress, eta }) => {
  const progressValue = typeof progress === 'number' ? progress : null;
  
  return (
    <div className="flex flex-col items-center space-y-6 animate-fade-in w-full">
      <div className="flex flex-col items-center mb-2">
        <LoadingCircular size="md" className="mb-4" />
        <span className="font-semibold text-xl" style={{ color: '#111827' }}>Encoding Video</span>
      </div>
      
      {/* Progress Display */}
      <div className="w-full mx-auto max-w-lg">
        {progressValue !== null ? (
          <>
            <progress className="progress progress-warning w-full" value={progressValue} max="100"></progress>
            <div className="flex justify-between text-sm mt-2" style={{ color: '#6b7280' }}>
              <span>{progressValue}%</span>
              {eta && <span>ETA: {eta}</span>}
            </div>
          </>
        ) : (
          <progress className="progress progress-warning w-full"></progress>
        )}
      </div>
      
      <p className="text-sm font-medium" style={{ color: '#6b7280' }}>
        Please wait while your video is being encoded.
      </p>
    </div>
  );
};

export default EncodingInProgress;
