import React, { useEffect, useState } from 'react';
import { Loader, AlertCircle, RefreshCcw, Clock } from 'lucide-react';
import { useScreenshotSearch } from '../hooks/useScreenshotSearch';

const Step9ProcessImages: React.FC = () => {
  const [globalLoading, setGlobalLoading] = useState(true);
  const [totalDuration, setTotalDuration] = useState<number>(0);
  const [processingStartTime, setProcessingStartTime] = useState<number>(0);
  const [showDuration, setShowDuration] = useState(false);

  // Use the screenshot search hook
  const { 
    searchState, 
    searchError, 
    searchResult, 
    searchProgress, 
    startSearch, 
    resetSearch 
  } = useScreenshotSearch();

  // Step 1: Initial preparation
  useEffect(() => {
    const timeout = setTimeout(() => {
      setGlobalLoading(false);
      setProcessingStartTime(Date.now());

      // Show duration in toolbar after preparation
      const preparationTime = (Date.now() - processingStartTime) / 1000;
      setTotalDuration(preparationTime);
      setShowDuration(true);

      // Start the search process with mock files
      const mockFiles = [
        new File([''], 'screenshot_001.png', { type: 'image/png' }),
        new File([''], 'screenshot_002.png', { type: 'image/png' }),
        new File([''], 'screenshot_003.png', { type: 'image/png' }),
        new File([''], 'screenshot_004.png', { type: 'image/png' }),
      ];
      startSearch(mockFiles);
    }, 1500);

    return () => clearTimeout(timeout);
  }, []);

  const handleRetry = () => {
    resetSearch();
    setGlobalLoading(true);
    
    setTimeout(() => {
      setGlobalLoading(false);
      const mockFiles = [
        new File([''], 'screenshot_001.png', { type: 'image/png' }),
        new File([''], 'screenshot_002.png', { type: 'image/png' }),
        new File([''], 'screenshot_003.png', { type: 'image/png' }),
        new File([''], 'screenshot_004.png', { type: 'image/png' }),
      ];
      startSearch(mockFiles);
    }, 1000);
  };

  // Get processed images from search result
  const processed = searchResult?.matches.map((match, idx) => ({
    url: match.url,
    filename: match.filename,
    status: searchState === 'done' ? 'done' as const : 
            searchState === 'error' ? 'error' as const : 'processing' as const,
    progress: searchState === 'done' ? 100 : searchProgress.progress,
    duration: searchResult?.processingTime,
    errorMsg: searchError || undefined,
  })) || [];

  return (
    <div className="w-full h-full p-6">
      <div className="rounded-xl border shadow-sm overflow-hidden h-full flex flex-col" style={{ background: '#fdfcfb', borderColor: '#e8e6e3' }}>
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: '#e8e6e3', borderBottomWidth: '1px' }}>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f0fdfa' }}>
              <Loader className="w-4 h-4" style={{ color: '#14b8a6' }} />
            </div>
            <h2 className="text-lg font-semibold" style={{ color: '#111827' }}>
              Process Images
            </h2>
          </div>
        </div>

        {showDuration && searchResult && (
          <div className="px-6 pt-4 pb-2">
            <div className="text-center p-4 rounded-lg border inline-flex items-center space-x-3" style={{ borderColor: '#e8e6e3', background: '#fdfcfb' }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#dbeafe' }}>
                <Clock className="w-5 h-5" style={{ color: '#2563eb' }} />
              </div>
              <div className="text-left">
                <p className="text-xs font-medium mb-1" style={{ color: '#6b7280' }}>Processing Duration</p>
                <p className="text-sm font-semibold" style={{ color: '#111827' }}>{searchResult.processingTime}s</p>
              </div>
            </div>
          </div>
        )}

        <div className="px-6 pt-2 pb-8">
          {/* Step 1: Global loading state */}
          {globalLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(245,158,66,0.08)' }}>
                <svg className="animate-spin" width="32" height="32" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="#f59e42" strokeWidth="4" fill="none" opacity="0.2" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="#f59e42" strokeWidth="4" fill="none" strokeLinecap="round" />
                </svg>
              </div>
              <span className="mt-4 text-sm font-medium" style={{ color: '#f59e42' }}>Preparing images...</span>
            </div>
          )}

          {/* Step 2: Image grid with processing states */}
          {!globalLoading && (
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

                  <div className="mt-3 flex justify-between items-center">
                    <span className="text-sm font-medium truncate" style={{ color: '#111827' }}>{img.filename}</span>
                    {img.status === 'done' && img.duration && (
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#dbeafe' }}>
                          <Clock className="w-3 h-3" style={{ color: '#2563eb' }} />
                        </div>
                        <span className="text-sm font-semibold" style={{ color: '#111827' }}>
                          {img.duration.toFixed(1)}s
                        </span>
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
          )}

          {/* Global error state */}
          {searchError && !globalLoading && (
            <div className="mt-6 flex items-start space-x-3 p-4 rounded-lg" style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#fee2e2' }}>
                <AlertCircle className="w-4 h-4" style={{ color: '#ef4444' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold" style={{ color: '#dc2626' }}>Processing Error</p>
                <p className="text-sm" style={{ color: '#991b1b' }}>{searchError}</p>
                <button
                  className="mt-3 px-4 py-2 rounded text-sm font-medium flex items-center space-x-2 transition-colors"
                  style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}
                  onClick={handleRetry}
                >
                  <RefreshCcw className="w-4 h-4" />
                  <span>Retry Processing</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Step9ProcessImages;