import React from 'react';

interface DecodingInProgressProps {
  progress: number;
  eta: string;
  currentFrame: number;
  totalFrames: number;
}

const DecodingInProgress: React.FC<DecodingInProgressProps> = ({
  progress, eta, currentFrame, totalFrames
}) => (
  <div className="flex flex-col items-center space-y-6 animate-fade-in w-full">
    <div className="flex flex-col items-center mb-2">
      <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(245,158,66,0.08)' }}>
        <svg className="animate-spin" width="32" height="32" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="#f59e42" strokeWidth="4" fill="none" opacity="0.2" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="#f59e42" strokeWidth="4" fill="none" strokeLinecap="round" />
        </svg>
      </div>
      <span className="mt-4 font-semibold text-xl" style={{ color: '#111827' }}>Decoding Video</span>
    </div>
    <div className="w-full mx-auto max-w-lg">
      {/* DaisyUI native progress bar */}
      <progress className="progress progress-warning w-full" value={progress} max={100}></progress>
      <div className="flex items-center justify-between mt-2">
        <span className="text-sm font-medium" style={{ color: '#6b7280' }}>
          {Math.round(progress)}%
        </span>
        <span className="text-sm font-medium" style={{ color: '#6b7280' }}>
          {eta}
        </span>
      </div>
    </div>
    <p className="text-sm font-medium mt-4" style={{ color: '#6b7280' }}>
      Please wait while your video is being decoded.
    </p>
  </div>
);

export default DecodingInProgress;
