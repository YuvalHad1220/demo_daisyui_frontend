import React from 'react';
import { Check } from 'lucide-react';

interface SearchProgressProps {
  processingMethod: string;
  eta: string;
  matchesFound: number;
  currentFrame: number;
  totalFrames: number;
  waiting?: boolean;
  finished?: boolean;
}

const SearchProgress: React.FC<SearchProgressProps> = ({
  eta,
  waiting,
  finished
}) => (
  <div className="w-full max-w-lg mb-4 animate-fade-in">
    {/* Indeterminate progress bar for search */}
    <progress className="progress progress-warning w-full"></progress>
    <div className="flex items-center justify-between mt-2">
      <div className="flex items-center space-x-2">
        {finished && <Check className="w-4 h-4" style={{ color: '#22c55e' }} />}
        <span className="text-sm font-medium" style={{ color: '#6b7280' }}>
          {finished ? 'Finished' : waiting ? 'Waiting...' : 'Searching...'}
        </span>
      </div>
      {eta && eta !== 'N/A' && !finished && (
        <span className="text-sm font-medium" style={{ color: '#6b7280' }}>
          ETA: {eta}
        </span>
      )}
    </div>
    <div className="text-xs mt-1" style={{ color: '#9ca3af' }}>
      Vector search
    </div>
  </div>
);

export default SearchProgress;
