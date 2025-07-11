import React, { useState, useRef, useCallback } from 'react';
import { Clock } from 'lucide-react';
import { StageCard } from '../components/ui/StageCard';
import { useWorkflow } from '../hooks/useWorkflow';
import VideoPlayerSection from './step10ShowTimestamps/VideoPlayerSection';
import ScreenshotsGrid from './step10ShowTimestamps/ScreenshotsGrid';

interface HoveredScreenshot {
  shot: any;
  idx: number;
}

const Step10ShowTimestamps: React.FC<{ onResetGroup: () => void }> = ({ onResetGroup }) => {
  const [clicked, setClicked] = useState<number | null>(null);
  const [hoveredScreenshot, setHoveredScreenshot] = useState<HoveredScreenshot | null>(null);

  // Video player state
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(60);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Get the workflow context
  const { fileUpload, screenshotSearch } = useWorkflow();
  const {
    searchResult,
    searchState,
    searchError,
    jumpToTimestamp,
    takeScreenshot,
    resetSearch,
    uploadedImageUrls,
    isResetting,
    hasMatches
  } = screenshotSearch;

  // Use the workflow toast system
  const { toast } = useWorkflow();

  // Construct HLS URL from uploaded filename (same as Step5)
  const getDecodedVideoUrl = (): string => {
    const filename = fileUpload.uploadedFile?.name?.replace('.mp4', '') || '';
    const key = fileUpload.uploadedFile?.key;
    const keyParam = key ? `?key=${encodeURIComponent(key)}` : '';
    return `http://localhost:9000/hls/${filename}/decoded/stream.m3u8${keyParam}`;
  };

  const decodedVideoUrl = getDecodedVideoUrl();

  // Transform backend results to match the ScreenshotsGrid interface
  const screenshots = searchResult?.data?.map((item: any, idx: number) => {
    // Get the query image name from the query path
    const queryName = item.query?.split('/').pop() || `Image ${idx + 1}`;
    
    // Get the best match (highest similarity)
    const bestMatch = item.top_results?.[0];
    
    // Get the uploaded image URL
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
    
    // Format timestamp
    const formatTimestamp = (seconds: number): string => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return {
      url: imageUrl,
      filename: queryName,
      timestamp: formatTimestamp(bestMatch?.timestamp || 0),
      confidence: Math.round((bestMatch?.similarity || 0) * 100),
    };
  }) || [];

  // Memoize event handlers to prevent re-renders
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  }, []);

  const handleScreenshot = async () => {
    try {
      await takeScreenshot();
      toast.showSuccess('Screenshot saved!', 'Your screenshot has been successfully captured.');
    } catch (error) {
      console.error('Failed to take screenshot:', error);
      toast.showError('Screenshot failed', 'Failed to capture screenshot. Please try again.');
    }
  };

  const handleTimestampClick = async (idx: number, ts: string) => {
    setClicked(idx);
    toast.showInfo(`Jumped to ${ts}`, 'Video position updated successfully.');

    try {
      await jumpToTimestamp(ts);
      // In a real implementation, this would control the video player
      if (videoRef.current) {
        // Convert timestamp to seconds and seek
        const [minutes, seconds] = ts.split(':').map(Number);
        const totalSeconds = minutes * 60 + seconds;
        videoRef.current.currentTime = totalSeconds;
      }
    } catch (error) {
      console.error('Failed to jump to timestamp:', error);
      toast.showError('Navigation failed', 'Failed to jump to timestamp. Please try again.');
    }
  };

  const handleReset = async () => {
    await resetSearch();
    onResetGroup();
  };

  return (
    <StageCard
      title="Screenshot Timestamps"
      icon={Clock}
      showReset={false}
      resetTitle="Reset Screenshots"
      onResetClick={handleReset}
      resetting={isResetting}
    >
      <div className="px-6 py-8 flex-1 flex flex-col">
        <VideoPlayerSection
          error={error}
          searchError={searchError}
          decodedVideoUrl={decodedVideoUrl}
          currentTime={currentTime}
          duration={duration}
          handleTimeUpdate={handleTimeUpdate}
          handleLoadedMetadata={handleLoadedMetadata}
          setError={setError}
          videoRef={videoRef}
        />

        <div className="w-full max-w-6xl mx-auto relative">
          <div className="rounded-xl p-6 max-h-[600px] overflow-y-auto border" style={{ borderColor: '#d1d5db', backgroundColor: '#fdfcfb' }}>
            <ScreenshotsGrid
              screenshots={screenshots}
              searchState={searchState}
              clicked={clicked}
              hoveredScreenshot={hoveredScreenshot}
              setHoveredScreenshot={setHoveredScreenshot}
              handleTimestampClick={handleTimestampClick}
            />
          </div>
          
          {/* Tooltip rendered outside scrollable container */}
          {hoveredScreenshot && (
            <div className="absolute z-50 pointer-events-none" style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}>
              <div className="rounded-lg shadow-lg p-6" style={{ background: '#fdfcfb', borderColor: '#e8e6e3', border: '1px solid', minWidth: '320px' }}>
                <img
                  src={hoveredScreenshot.shot.url}
                  alt={hoveredScreenshot.shot.filename}
                  className="w-full h-60 object-cover rounded mb-4"
                />
                <div className="text-center">
                  <p className="text-sm font-medium mb-1" style={{ color: '#111827' }}>
                    {hoveredScreenshot.shot.filename}
                  </p>
                  <p className="text-xs" style={{ color: '#6b7280' }}>
                    Timestamp: {hoveredScreenshot.shot.timestamp}
                  </p>
                  <p className="text-xs" style={{ color: '#6b7280' }}>
                    Confidence: {hoveredScreenshot.shot.confidence}%
                  </p>
                </div>
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
    </StageCard>
  );
};

export default Step10ShowTimestamps;