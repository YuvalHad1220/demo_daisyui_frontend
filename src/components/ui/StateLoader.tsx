import React from 'react';
import { Loader } from 'lucide-react';
import { ProgressBar } from './ProgressBar';

interface StateLoaderProps {
  message?: string;
  progress?: number | null;
  className?: string;
}

export const StateLoader: React.FC<StateLoaderProps> = ({ message = 'Uploading video...', progress, className = '' }) => (
  <div className={`px-6 pb-6 flex-shrink-0 ${className}`}>
    <div className="space-y-4">
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center space-x-2">
          <Loader className="w-5 h-5 animate-spin" style={{ color: '#f59e42' }} />
          <span className="font-semibold" style={{ color: '#111827' }}>{message}</span>
        </div>
        <ProgressBar value={typeof progress === 'number' ? progress : undefined} />
        <p className="text-sm font-medium" style={{ color: '#6b7280' }}>
          {typeof progress === 'number' ? `${Math.round(progress)}% complete` : 'Processing...'}
        </p>
      </div>
    </div>
  </div>
); 