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
  eta,
  waiting
}) => (
  <div className="w-full max-w-md mb-4 animate-fade-in">
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
    <div className="text-xs mt-1" style={{ color: '#9ca3af' }}>
      Searching for screenshots in video…
    </div>
  </div>
);

export default SearchProgress;
