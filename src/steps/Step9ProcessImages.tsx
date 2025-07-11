import React, { useEffect, useState } from 'react';
import { useWorkflow } from '../hooks/WorkflowContext';
import ProcessingHeader from './step9ProcessImages/ProcessingHeader';
import ProcessingDuration from './step9ProcessImages/ProcessingDuration';
import GlobalLoading from './step9ProcessImages/GlobalLoading';
import ImageGrid from './step9ProcessImages/ImageGrid';
import GlobalError from './step9ProcessImages/GlobalError';

const Step9ProcessImages: React.FC = () => {
  const [showDuration, setShowDuration] = useState(false);

  // Use the screenshot search hook from workflow context
  const { screenshotSearch } = useWorkflow();
  const {
    searchState,
    searchError,
    searchResult,
    searchProgress,
    resetSearch,
    uploadedImageUrls
  } = screenshotSearch;

  // Show duration when search is done
  useEffect(() => {
    if (searchState === 'done' && searchResult) {
      setShowDuration(true);
    }
  }, [searchState, searchResult]);

  const handleRetry = () => {
    resetSearch();
    setShowDuration(false);
  };

  // Transform backend results to match our interface
  const processed = searchResult?.data?.map((item: any, idx: number) => {
    // Get the query image name from the query path
    const queryName = item.query?.split('/').pop() || `Image ${idx + 1}`;
    
    // Get the best match (highest similarity)
    const bestMatch = item.top_results?.[0];
    
    // Get the uploaded image URL from the workflow context
    const imageUrl = uploadedImageUrls[queryName] || '';
    
    return {
      url: imageUrl,
      filename: queryName,
      status: searchState === 'done' ? 'done' as const :
              searchState === 'error' ? 'error' as const : 'processing' as const,
      progress: searchState === 'done' ? 100 : searchProgress.progress,
      duration: item.duration_seconds,
      timestamp: bestMatch?.timestamp,
      similarity: bestMatch?.similarity,
      errorMsg: searchError || undefined,
    };
  }) || [];

  // Get the total processing duration from metadata
  const totalDuration = searchResult?.metadata?.duration_seconds || 0;

  return (
    <div className="w-full h-full p-6">
      <div className="rounded-xl border shadow-sm overflow-hidden h-full flex flex-col" style={{ background: '#fdfcfb', borderColor: '#e8e6e3' }}>
        {/* Header and duration always at the top */}
        <div className="flex-shrink-0">
          <ProcessingHeader />
          {showDuration && searchResult && totalDuration > 0 && (
            <ProcessingDuration duration={totalDuration} />
          )}
        </div>
        {/* Scrollable grid area */}
        <div className="flex-1 min-h-0">
          <div className="h-full w-full flex flex-col">
            <div className="flex-1 overflow-y-auto px-6 pt-2 pb-8">
              {searchState === 'initial' && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Ready to process images</p>
                </div>
              )}

              {searchState === 'searching' && (
                <GlobalLoading />
              )}

              {searchState === 'done' && processed.length > 0 && (
                <div className="max-w-6xl mx-auto">
                  <ImageGrid processed={processed} handleRetry={handleRetry} />
                </div>
              )}

              {searchState === 'done' && processed.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No processed images found</p>
                </div>
              )}

              {searchState === 'error' && (
                <GlobalError searchError={searchError} handleRetry={handleRetry} />
              )}
            </div>
          </div>
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