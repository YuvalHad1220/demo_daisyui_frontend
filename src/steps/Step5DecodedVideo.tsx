import React, { useRef, useState, useCallback } from 'react';
import { Play } from 'lucide-react';
import { useWorkflow } from '../hooks/WorkflowContext';
import { ErrorAlert } from '../components/ui/ErrorAlert';
import { StageCard } from '../components/ui/StageCard';
import VideoPlayer from './step5DecodedVideo/VideoPlayer';
import ScreenshotButton from './step5DecodedVideo/ScreenshotButton';

const Step5DecodedVideo: React.FC<{ onResetGroup: () => void; isFirstStepInGroup: boolean }> = ({ onResetGroup, isFirstStepInGroup }) => {
  const { fileUpload, decoding, toast } = useWorkflow();
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Construct HLS URL from uploaded filename
  const getDecodedVideoUrl = (): string => {
    const filename = fileUpload.uploadedFile?.name?.replace('.mp4', '') || '';
    const key = fileUpload.uploadedFile?.key;
    const keyParam = key ? `?key=${encodeURIComponent(key)}` : '';
    return `http://localhost:9000/hls/${filename}/decoded/stream.m3u8${keyParam}`;
  };

  const decodedVideoUrl = getDecodedVideoUrl();

  // Memoize event handlers to prevent re-renders
  const handlePlay = useCallback(() => setIsPlaying(true), []);
  const handlePause = useCallback(() => setIsPlaying(false), []);
  const handleEnded = useCallback(() => setIsPlaying(false), []);
  const handleTimeUpdate = useCallback((time: number) => setCurrentTime(time), []);
  const handleLoadedMetadata = useCallback((dur: number) => setDuration(dur), []);

  const handleScreenshot = () => {
    try {
      decoding.takeScreenshot(videoRef.current, currentTime);
      toast.showSuccess('Screenshot saved!', 'Your screenshot has been downloaded successfully.');
    } catch (err) {
      setError('Failed to take screenshot');
      console.error('Screenshot error:', err);
    }
  };

  return (
    <StageCard
      title="Video Decoding & Playback"
      icon={Play}
      showReset={isFirstStepInGroup}
      resetTitle="Reset Decoding"
      onResetClick={onResetGroup}
    >

      
      <div className="px-6 py-8">
        {error && (
          <div className="w-full mb-4 animate-shake">
            <ErrorAlert title="Playback Error" message={error} />
          </div>
        )}
        
        <VideoPlayer
          decodedVideoUrl={decodedVideoUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onError={setError}
          onPlay={handlePlay}
          onPause={handlePause}
          onEnded={handleEnded}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          videoRef={videoRef}
          decodingState={decoding.decodingState}
        />
        
        <ScreenshotButton
          onClick={handleScreenshot}
          disabled={!!error || !decodedVideoUrl}
        />
      </div>
    </StageCard>
  );
};

export default Step5DecodedVideo; 