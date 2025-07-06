import React, { useRef, useEffect, useState } from 'react';
import { Video, Play, Pause, Volume2, VolumeX, Maximize2, RotateCcw } from 'lucide-react';

export interface VideoPlayerProps {
  src: string;
  className?: string;
  controls?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  onLoad?: (video: HTMLVideoElement) => void;
  onDurationChange?: (duration: number) => void;
  onResolutionChange?: (width: number, height: number) => void;
  showCustomControls?: boolean;
  aspectRatio?: 'video' | 'square' | 'custom';
  customAspectRatio?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  className = "",
  controls = true,
  autoPlay = false,
  muted = false,
  loop = false,
  onLoad,
  onDurationChange,
  onResolutionChange,
  showCustomControls = false,
  aspectRatio = 'video',
  customAspectRatio
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      onLoad?.(video);
      onDurationChange?.(video.duration);
      onResolutionChange?.(video.videoWidth, video.videoHeight);
      setDuration(video.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
    };
  }, [onLoad, onDurationChange, onResolutionChange]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (!isFullscreen) {
        videoRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  };

  const resetVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'video':
        return 'aspect-video';
      case 'square':
        return 'aspect-square';
      case 'custom':
        return '';
      default:
        return 'aspect-video';
    }
  };

  return (
    <div className={`relative ${getAspectRatioClass()} ${className}`} style={aspectRatio === 'custom' && customAspectRatio ? { aspectRatio: customAspectRatio } : undefined}>
      <div className="w-full h-full bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden border" style={{ borderColor: '#e5e7eb' }}>
        {src ? (
          <>
            <video
              ref={videoRef}
              src={src}
              className="w-full h-full object-contain rounded-lg"
              controls={!showCustomControls && controls}
              autoPlay={autoPlay}
              muted={muted}
              loop={loop}
            />
            
            {/* Custom Controls */}
            {showCustomControls && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-center space-x-4">
                  {/* Play/Pause Button */}
                  <button
                    onClick={togglePlay}
                    className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4 text-white" />
                    ) : (
                      <Play className="w-4 h-4 text-white" />
                    )}
                  </button>

                  {/* Progress Bar */}
                  <div className="flex-1">
                    <input
                      type="range"
                      min="0"
                      max={duration || 0}
                      value={currentTime}
                      onChange={handleSeek}
                      className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, white 0%, white ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.3) ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.3) 100%)`
                      }}
                    />
                  </div>

                  {/* Time Display */}
                  <span className="text-white text-sm font-medium min-w-[60px]">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>

                  {/* Volume Control */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={toggleMute}
                      className="w-6 h-6 text-white hover:text-gray-300 transition-colors"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-16 h-1 bg-white/30 rounded-full appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Fullscreen Button */}
                  <button
                    onClick={toggleFullscreen}
                    className="w-6 h-6 text-white hover:text-gray-300 transition-colors"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>

                  {/* Reset Button */}
                  <button
                    onClick={resetVideo}
                    className="w-6 h-6 text-white hover:text-gray-300 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-3 opacity-40">
            <Video className="w-12 h-12" style={{ color: '#9ca3af' }} />
            <p className="text-sm font-medium" style={{ color: '#9ca3af' }}>Video Preview</p>
          </div>
        )}
      </div>
    </div>
  );
}; 