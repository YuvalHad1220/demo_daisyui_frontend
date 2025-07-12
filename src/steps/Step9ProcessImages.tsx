import React, { useEffect, useState } from 'react';
import { Loader } from 'lucide-react';
import { StageCard } from '../components/ui/StageCard';
import { useWorkflow } from '../hooks/useWorkflow';
import ProcessingDuration from './step9ProcessImages/ProcessingDuration';
import GlobalLoading from './step9ProcessImages/GlobalLoading';
import ImageGrid from './step9ProcessImages/ImageGrid';
import GlobalError from './step9ProcessImages/GlobalError';

interface Step9ProcessImagesProps {
  onResetGroup: () => void;
}

const Step9ProcessImages: React.FC<Step9ProcessImagesProps> = ({ onResetGroup }) => {
  const [showDuration, setShowDuration] = useState(false);

  // Use the screenshot search hook from workflow context
  const { screenshotSearch } = useWorkflow();
  const {
    searchState,
    searchError,
    searchResult,
    searchProgress,
    resetSearch,
    uploadedImageUrls,
    isLoading,
    hasError,
    isComplete,
    hasResult
  } = screenshotSearch;

  // Show duration when search is done
  useEffect(() => {
    if (isComplete && hasResult) {
      setShowDuration(true);
    }
  }, [isComplete, hasResult]);

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
    let imageUrl = uploadedImageUrls[queryName] || '';
    
    // If not found by exact name, try to find by partial match
    if (!imageUrl) {
      const matchingKey = Object.keys(uploadedImageUrls).find(key => 
        key.includes(queryName.replace(/\.[^/.]+$/, '')) || 
        queryName.includes(key.replace(/\.[^/.]+$/, ''))
      );
      if (matchingKey) {
        imageUrl = uploadedImageUrls[matchingKey];
      }
    }
    
    return {
      url: imageUrl,
      filename: queryName,
      status: isComplete ? 'done' as const :
              hasError ? 'error' as const : 'processing' as const,
      progress: isComplete ? 100 : searchProgress.progress,
      duration: item.duration_seconds,
      timestamp: bestMatch?.timestamp,
      similarity: bestMatch?.similarity,
      errorMsg: searchError || undefined,
    };
  }) || [];

  // Get the total processing duration from metadata
  const totalDuration = searchResult?.metadata?.duration_seconds || 0;

  return (
    <StageCard
      title="Process Images"
      icon={Loader}
    >
      <div className="flex flex-col h-full">
        {/* Duration display */}
        {showDuration && searchResult && totalDuration > 0 && (
          <div className="flex-shrink-0 px-6 py-2 border-b" style={{ borderColor: '#e5e7eb' }}>
            <ProcessingDuration duration={totalDuration} />
          </div>
        )}
        
        {/* Content area */}
        <div className="flex-1 px-6 py-6">
          {searchState === 'initial' && (
            <div className="text-center py-8">
              <p className="text-gray-500">Ready to process images</p>
            </div>
          )}

          {isLoading && (
            <GlobalLoading />
          )}

          {isComplete && processed.length > 0 && (
            <div className="w-full max-w-6xl mx-auto">
              <div className="rounded-xl p-6 max-h-[600px] overflow-y-auto border" style={{ borderColor: '#d1d5db', backgroundColor: '#fdfcfb' }}>
                <ImageGrid processed={processed} handleRetry={handleRetry} />
              </div>
            </div>
          )}

          {isComplete && processed.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No processed images found</p>
            </div>
          )}

          {hasError && (
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
    </StageCard>
  );
};

export default Step9ProcessImages;