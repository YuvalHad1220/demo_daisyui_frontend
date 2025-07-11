import React from 'react';

interface UploadProgressProps {
  progress: number;
  waiting?: boolean;
}

const UploadProgress: React.FC<UploadProgressProps> = ({ progress, waiting }) => (
  <div className="mb-4">
    <div className="w-full rounded-full h-3" style={{ background: '#fdfcfb' }}>
      <div
        className="h-3 rounded-full transition-all duration-300"
        style={{ background: 'linear-gradient(90deg, #f59e42 0%, #f97316 100%)', width: `${progress}%` }}
      />
    </div>
    <div className="flex items-center mt-2">
      <p className="text-sm font-medium" style={{ color: '#6b7280' }}>
        {waiting ? 'Waiting for upload...' : `${Math.round(progress)}% uploaded`}
      </p>
    </div>
    <div className="text-xs mt-1" style={{ color: '#9ca3af' }}>
      Uploading files to server…
    </div>
  </div>
);

export default UploadProgress;
