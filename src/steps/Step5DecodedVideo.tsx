import React, { useRef, useState } from 'react';
import { Play } from 'lucide-react';
import { ErrorAlert } from '../components/ui/ErrorAlert';
import { StageCard } from '../components/ui/StageCard';
import VideoPlayer from './step5DecodedVideo/VideoPlayer';
import ScreenshotButton from './step5DecodedVideo/ScreenshotButton';
import ScreenshotToast from './step5DecodedVideo/ScreenshotToast';

const Step5DecodedVideo: React.FC = () => {
  const [screenshotToast, setScreenshotToast] = useState(false);
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(60); // Simulated duration
  const [decodeFinished, setDecodeFinished] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Simulate decoded video URL
  const decodedVideoUrl = 'https://www.w3schools.com/html/mov_bbb.mp4';

  const handlePlay = () => {
    setIsPlaying(true);
    setDecodeFinished(false);
  };

  const handlePause = () => {
    setIsPlaying(false);
    setDecodeFinished(true);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setDecodeFinished(true);
  };

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  const handleLoadedMetadata = (dur: number) => {
    setDuration(dur);
  };

  const takeScreenshot = () => {
    if (!videoRef.current || !canvasRef.current) {
      setError('Video not loaded');
      return;
    }

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        setError('Failed to get canvas context');
        return;
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the current video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        if (!blob) {
          setError('Failed to create screenshot');
          return;
        }

        // Generate filename with timestamp
        const timestamp = Math.floor(currentTime);
        const filename = `demo_screenshot_${timestamp.toString().padStart(3, '0')}.png`;

        // Create download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Show success toast
        setScreenshotToast(true);
        setTimeout(() => setScreenshotToast(false), 1800);
      }, 'image/png');
    } catch (err) {
      setError('Failed to take screenshot');
      console.error('Screenshot error:', err);
    }
  };

  return (
    <StageCard
      title="Video Decoding & Playback"
      icon={Play}
    >
      {/* Hidden canvas for screenshot capture */}
      <canvas 
        ref={canvasRef} 
        style={{ display: 'none' }}
      />
      
      {/* Main Content */}
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
        />
        <ScreenshotButton
          onClick={takeScreenshot}
          disabled={!!error || !decodedVideoUrl}
        />
        {screenshotToast && (
          <ScreenshotToast />
        )}
      </div>
    </StageCard>
  );
};

export default Step5DecodedVideo; 