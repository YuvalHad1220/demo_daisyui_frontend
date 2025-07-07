import React from 'react';
import { Loader } from 'lucide-react';

interface UploadProgressProps {
  progress: number;
}

const UploadProgress: React.FC<UploadProgressProps> = ({ progress }) => (
  <div className="mb-4">
    <div className="w-full rounded-full h-3" style={{ background: '#fdfcfb' }}>
      <div
        className="h-3 rounded-full transition-all duration-300"
        style={{ background: 'linear-gradient(90deg, #f59e42 0%, #f97316 100%)', width: `${progress}%` }}
      />
    </div>
    <div className="flex items-center space-x-2 mt-2">
      <Loader className="w-5 h-5 animate-spin" style={{ color: '#f59e42' }} />
      <p className="text-sm font-medium" style={{ color: '#6b7280' }}>{Math.round(progress)}% uploaded</p>
    </div>
  </div>
);

export default UploadProgress;
