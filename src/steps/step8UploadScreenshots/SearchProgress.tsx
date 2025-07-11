import React from 'react';

interface SearchProgressProps {
  progress: number;
  processingMethod: string;
  eta: string;
  matchesFound: number;
  currentFrame: number;
  totalFrames: number;
  waiting?: boolean;
}

const SearchProgress: React.FC<SearchProgressProps> = ({
  progress,
  processingMethod,
  eta,
  matchesFound,
  currentFrame,
  totalFrames,
  waiting
}) => (
  <div className="flex flex-col items-center space-y-4 animate-fade-in">
    <div className="w-full max-w-md">
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="h-3 rounded-full transition-all duration-300"
          style={{ background: 'linear-gradient(90deg, #f59e42 0%, #f97316 100%)', width: `${progress}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-sm font-medium" style={{ color: '#6b7280' }}>
          {waiting ? 'Waiting for search...' : `${Math.round(progress)}%`}
        </span>
        <span className="text-sm font-medium" style={{ color: '#6b7280' }}>
          {eta}
        </span>
      </div>
    </div>
    <div className="text-xs mt-1" style={{ color: '#9ca3af' }}>
      Searching and preprocessing in video…
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
