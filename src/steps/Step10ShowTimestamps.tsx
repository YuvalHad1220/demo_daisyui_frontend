import React, { useState, useRef } from 'react';
import { Clock } from 'lucide-react';
import { StageCard } from '../components/ui/StageCard';
import { useWorkflow } from '../hooks/WorkflowContext';
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
    uploadedImageUrls
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
    const imageUrl = uploadedImageUrls[queryName] || '';
    
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

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

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

  const handleReset = () => {
    resetSearch();
    onResetGroup();
  };

  return (
    <StageCard
      title="Screenshot Timestamps"
      icon={Clock}
      showReset={false}
      resetTitle="Reset Screenshots"
      onResetClick={handleReset}
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

        <ScreenshotsGrid
          screenshots={screenshots}
          searchState={searchState}
          clicked={clicked}
          hoveredScreenshot={hoveredScreenshot}
          setHoveredScreenshot={setHoveredScreenshot}
          handleTimestampClick={handleTimestampClick}
        />
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