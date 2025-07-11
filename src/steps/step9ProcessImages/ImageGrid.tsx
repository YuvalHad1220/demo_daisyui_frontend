import React from 'react';
import { Loader, Clock, AlertCircle, RefreshCcw, Target } from 'lucide-react';

interface ProcessedImage {
  url: string;
  filename: string;
  status: 'done' | 'error' | 'processing';
  progress: number;
  duration?: number;
  timestamp?: number;
  similarity?: number;
  errorMsg?: string;
}

interface ImageGridProps {
  processed: ProcessedImage[];
  handleRetry: () => void;
}

const ImageGrid: React.FC<ImageGridProps> = ({ processed, handleRetry }) => {
  const formatTimestamp = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="grid grid-cols-2 gap-6 animate-fade-in">
      {processed.map((img, idx) => (
        <div key={idx} className="p-4 rounded-lg border" style={{ background: '#fdfcfb', borderColor: '#e8e6e3' }}>
          <div className="aspect-video rounded-lg overflow-hidden relative" style={{ background: '#fdfcfb' }}>
            <img
              src={img.url}
              alt={img.filename}
              className="w-full h-full object-cover"
            />

            {/* Processing overlay */}
            {img.status === 'processing' && (
              <div
                className="absolute inset-0 z-10 flex flex-col justify-center items-center"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
              >
                <svg className="animate-spin" width="28" height="28" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="#f59e42" strokeWidth="4" fill="none" opacity="0.2" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="#f59e42" strokeWidth="4" fill="none" strokeLinecap="round" />
                </svg>
              </div>
            )}
          </div>

          <div className="mt-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium truncate" style={{ color: '#111827' }}>{img.filename}</span>
              {img.status === 'done' && img.duration && (
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#dbeafe' }}>
                    <Clock className="w-3 h-3" style={{ color: '#2563eb' }} />
                  </div>
                  <span className="text-sm font-semibold" style={{ color: '#111827' }}>
                    {img.duration.toFixed(2)}s
                  </span>
                </div>
              )}
            </div>

            {/* Timestamp and Similarity */}
            {img.status === 'done' && img.timestamp !== undefined && img.similarity !== undefined && (
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f0fdf4' }}>
                    <Clock className="w-3 h-3" style={{ color: '#22c55e' }} />
                  </div>
                  <span className="text-sm font-medium" style={{ color: '#111827' }}>
                    {formatTimestamp(img.timestamp)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#fef3c7' }}>
                    <Target className="w-3 h-3" style={{ color: '#f59e0b' }} />
                  </div>
                  <span className="text-sm font-medium" style={{ color: '#111827' }}>
                    {(img.similarity * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
          </div>

          {img.status === 'error' && img.errorMsg && (
            <div className="mt-3 flex items-start space-x-3 p-3 rounded-lg" style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
              <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#fee2e2' }}>
                <AlertCircle className="w-3 h-3" style={{ color: '#ef4444' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: '#dc2626' }}>{img.errorMsg}</p>
                <button
                  className="mt-2 px-3 py-1.5 rounded text-sm font-medium flex items-center space-x-1 transition-colors"
                  style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}
                  onClick={handleRetry}
                >
                  <RefreshCcw className="w-4 h-4 mr-1" />
                  <span>Retry</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ImageGrid;
