import React from 'react';
import { Loader } from 'lucide-react';

interface SearchProgressProps {
  progress: number;
  processingMethod: string;
  eta: string;
  matchesFound: number;
  currentFrame: number;
  totalFrames: number;
}

const SearchProgress: React.FC<SearchProgressProps> = ({
  progress, processingMethod, eta, matchesFound, currentFrame, totalFrames
}) => (
  <div className="mb-4">
    <div className="w-full rounded-full h-3" style={{ background: '#fdfcfb' }}>
      <div
        className="h-3 rounded-full transition-all duration-300"
        style={{ background: 'linear-gradient(90deg, #14b8a6 0%, #0d9488 100%)', width: `${progress}%` }}
      />
    </div>
    <div className="flex items-center justify-between mt-2">
      <div className="flex items-center space-x-2">
        <Loader className="w-5 h-5 animate-spin" style={{ color: '#14b8a6' }} />
        <p className="text-sm font-medium" style={{ color: '#6b7280' }}>
          {processingMethod}
        </p>
      </div>
      <p className="text-sm font-medium" style={{ color: '#6b7280' }}>
        {Math.round(progress)}% • {eta}
      </p>
    </div>
    <p className="text-xs mt-1" style={{ color: '#6b7280' }}>
      Found {matchesFound} matches • Frame {currentFrame}/{totalFrames}
    </p>
  </div>
);

export default SearchProgress;
