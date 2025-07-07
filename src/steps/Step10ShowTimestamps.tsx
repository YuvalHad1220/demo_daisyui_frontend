import React, { useState, useRef } from 'react';
import { Clock } from 'lucide-react';
import { StageCard } from '../components/ui/StageCard';
import { useScreenshotSearch } from '../hooks/useScreenshotSearch';
import { useWorkflow } from '../hooks/WorkflowContext';
import VideoPlayerSection from './step10ShowTimestamps/VideoPlayerSection';
import ScreenshotsGrid from './step10ShowTimestamps/ScreenshotsGrid';

interface HoveredScreenshot {
  shot: any;
  idx: number;
}

const Step10ShowTimestamps = () => {
  const [clicked, setClicked] = useState<number | null>(null);
  const [hoveredScreenshot, setHoveredScreenshot] = useState<HoveredScreenshot | null>(null);

  // Video player state
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(60);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const decodedVideoUrl = 'https://www.w3schools.com/html/mov_bbb.mp4';

  // Use the screenshot search hook
  const {
    searchResult,
    searchState,
    searchError,
    jumpToTimestamp,
    takeScreenshot
  } = useScreenshotSearch();

  // Use the workflow toast system
  const { toast } = useWorkflow();

  // Get screenshots from search result
  const screenshots = searchResult?.matches || [];

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
        const [hours, minutes, seconds] = ts.split(':').map(Number);
        const totalSeconds = hours * 3600 + minutes * 60 + seconds;
        videoRef.current.currentTime = totalSeconds;
      }
    } catch (error) {
      console.error('Failed to jump to timestamp:', error);
      toast.showError('Navigation failed', 'Failed to jump to timestamp. Please try again.');
    }
  };

  return (
    <StageCard
      title="Screenshot Timestamps"
      icon={Clock}
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