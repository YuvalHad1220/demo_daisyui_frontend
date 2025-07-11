import React from 'react';

interface UploadProgressProps {
  progress: number;
  waiting?: boolean;
}

const UploadProgress: React.FC<UploadProgressProps> = ({ progress, waiting }) => (
  <div className="w-full max-w-md mb-4 animate-fade-in">
    <div className="w-full bg-gray-200 rounded-full h-3">
      <div
        className="h-3 rounded-full transition-all duration-300"
        style={{ background: 'linear-gradient(90deg, #f59e42 0%, #f97316 100%)', width: `${progress}%` }}
      />
    </div>
    <div className="flex items-center justify-between mt-2">
      <span className="text-sm font-medium" style={{ color: '#6b7280' }}>
        {waiting ? 'Waiting for upload...' : `${Math.round(progress)}%`}
      </span>
    </div>
    <div className="text-xs mt-1" style={{ color: '#9ca3af' }}>
      Uploading files to server…
    </div>
  </div>
);

export default UploadProgress;
