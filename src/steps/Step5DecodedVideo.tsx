import React, { useRef, useState } from 'react';
import { Play, Camera, AlertCircle } from 'lucide-react';
import { StageCard } from '../components/ui/StageCard';
import { AppButton } from '../components/ui/AppButton';

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

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Subtle badge style
  const badgeStyle: React.CSSProperties = {
    background: '#f3f4f6',
    color: '#6b7280',
    fontSize: 12,
    fontWeight: 500,
    padding: '2px 10px',
    borderRadius: 8,
    marginBottom: 8,
    display: 'inline-block',
    letterSpacing: 0.2,
  };
  const badgeText = isPlaying ? 'Decode in progress' : 'Decode finished';

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
            <div className="flex items-start space-x-3 p-4 rounded-lg border" style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#fee2e2' }}>
                <AlertCircle className="w-4 h-4" style={{ color: '#ef4444' }} />
              </div>
              <div>
                <p className="font-semibold" style={{ color: '#dc2626' }}>Playback Error</p>
                <p className="text-sm" style={{ color: '#991b1b' }}>{error}</p>
              </div>
            </div>
          </div>
        )}
        {/* Subtle Badge */}
        <div className="w-full flex items-center" style={{ marginBottom: 4 }}>
          <span style={badgeStyle}>{badgeText}</span>
        </div>
        {/* Video Player */}
        <div className="w-full max-w-xl aspect-video bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden border mb-2" style={{ borderColor: '#e5e7eb' }}>
          <video
            ref={videoRef}
            src={decodedVideoUrl}
            className="w-full h-full object-contain rounded-lg"
            controls
            onPlay={handlePlay}
            onPause={handlePause}
            onEnded={handleEnded}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onError={() => setError('Failed to load video.')}
            style={{ background: '#f9fafb' }}
          />
        </div>
        {/* Timestamp (subtle, left-aligned, small) */}
        <div className="w-full max-w-xl mb-6" style={{ textAlign: 'left' }}>
          <span style={{ fontSize: 12, color: '#6b7280', fontFamily: 'monospace', fontWeight: 400 }}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
        {/* Screenshot Button */}
        <AppButton
          icon={<Camera className="w-5 h-5" />}
          onClick={takeScreenshot}
          className="mb-2"
          disabled={!!error || !decodedVideoUrl}
        >
          Take Screenshot
        </AppButton>
        {/* Screenshot Toast */}
        {screenshotToast && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white border rounded-lg shadow-lg px-6 py-3 flex items-center space-x-2 animate-fade-in z-[999]" style={{ borderColor: '#14b8a6', zIndex: 999 }}>
            <Camera className="w-5 h-5" style={{ color: '#14b8a6' }} />
            <span className="font-semibold text-sm" style={{ color: '#14b8a6' }}>Screenshot saved!</span>
          </div>
        )}
      </div>
    </StageCard>
  );
};

export default Step5DecodedVideo; 