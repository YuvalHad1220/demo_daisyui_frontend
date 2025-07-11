import React from 'react';

interface SearchProgressProps {
  progress: number;
  processingMethod: string;
  eta: string;
  matchesFound: number;
  currentFrame: number;
  totalFrames: number;
}

const SearchProgress: React.FC<SearchProgressProps> = ({
  progress,
  processingMethod,
  eta,
  matchesFound,
  currentFrame,
  totalFrames
}) => (
  <div className="flex flex-col items-center space-y-6 animate-fade-in">
    <div className="flex flex-col items-center mb-2">
      <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(245,158,66,0.08)' }}>
        <svg className="animate-spin" width="32" height="32" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="#f59e42" strokeWidth="4" fill="none" opacity="0.2" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="#f59e42" strokeWidth="4" fill="none" strokeLinecap="round" />
        </svg>
      </div>
      <span className="mt-4 font-semibold text-xl" style={{ color: '#111827' }}>Searching Video</span>
    </div>
    
    <div className="w-full max-w-md">
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="h-3 rounded-full transition-all duration-300"
          style={{ background: 'linear-gradient(90deg, #f59e42 0%, #f97316 100%)', width: `${progress}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-sm font-medium" style={{ color: '#6b7280' }}>
          {Math.round(progress)}%
        </span>
        <span className="text-sm font-medium" style={{ color: '#6b7280' }}>
          {eta}
        </span>
      </div>
    </div>
    
    <div className="text-center space-y-2">
      <div className="text-sm font-medium" style={{ color: '#6b7280' }}>
        {processingMethod}
      </div>
      <div className="text-sm" style={{ color: '#9ca3af' }}>
        Frame {currentFrame} of {totalFrames} • {matchesFound} matches found
      </div>
    </div>
    
    <p className="text-sm font-medium" style={{ color: '#6b7280' }}>
      Please wait while we search for your screenshots in the video.
    </p>
  </div>
);

export default SearchProgress;
