import React from 'react';
import LoadingCircular from '../../components/ui/LoadingCircular';

interface EncodingInProgressProps {
  progress: number | string;
  eta: string | null;
}

const EncodingInProgress: React.FC<EncodingInProgressProps> = ({ progress, eta }) => (
  <div className="flex flex-col items-center space-y-6 animate-fade-in">
    <div className="flex flex-col items-center mb-2">
      <LoadingCircular size="md" className="mb-4" />
      <span className="font-semibold text-xl" style={{ color: '#111827' }}>Encoding Video</span>
    </div>
    
    {/* Progress Display */}
    <div className="text-center space-y-2">
      <div className="text-sm font-medium" style={{ color: '#6b7280' }}>
        {typeof progress === 'number' ? `Progress: ${progress}%` : `Progress: ${progress}`}
      </div>
      {eta && (
        <div className="text-xs" style={{ color: '#9ca3af' }}>
          ETA: {eta}
        </div>
      )}
    </div>
    
    <p className="text-sm font-medium" style={{ color: '#6b7280' }}>
      Please wait while your video is being encoded.
    </p>
  </div>
);

export default EncodingInProgress;
