import React, { useEffect, useState } from 'react';
import { useScreenshotSearch } from '../hooks/useScreenshotSearch';
import ProcessingHeader from './step9ProcessImages/ProcessingHeader';
import ProcessingDuration from './step9ProcessImages/ProcessingDuration';
import GlobalLoading from './step9ProcessImages/GlobalLoading';
import ImageGrid from './step9ProcessImages/ImageGrid';
import GlobalError from './step9ProcessImages/GlobalError';

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
        <ProcessingHeader />

        {showDuration && searchResult && (
          <ProcessingDuration duration={searchResult.processingTime} />
        )}

        <div className="px-6 pt-2 pb-8">
          {globalLoading && (
            <GlobalLoading />
          )}

          {!globalLoading && (
            <ImageGrid processed={processed} handleRetry={handleRetry} />
          )}

          {searchError && !globalLoading && (
            <GlobalError searchError={searchError} handleRetry={handleRetry} />
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