import React, { useRef, useState } from 'react';

interface VideoPlayerProps {
  decodedVideoUrl: string;
  onTimeUpdate: (time: number) => void;
  onLoadedMetadata: (duration: number) => void;
  onError: (message: string) => void;
  onPlay: () => void;
  onPause: () => void;
  onEnded: () => void;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  decodedVideoUrl,
  onTimeUpdate,
  onLoadedMetadata,
  onError,
  onPlay,
  onPause,
  onEnded,
  isPlaying,
  currentTime,
  duration,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      onTimeUpdate(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      onLoadedMetadata(videoRef.current.duration);
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

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
    <>
      <div className="w-full flex items-center" style={{ marginBottom: 4 }}>
        <span style={badgeStyle}>{badgeText}</span>
      </div>
      <div className="w-full max-w-xl aspect-video bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden border mb-2" style={{ borderColor: '#e5e7eb' }}>
        <video
          ref={videoRef}
          src={decodedVideoUrl}
          className="w-full h-full object-contain rounded-lg"
          controls
          onPlay={onPlay}
          onPause={onPause}
          onEnded={onEnded}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onError={() => onError('Failed to load video.')}
          style={{ background: '#f9fafb' }}
        />
      </div>
      <div className="w-full max-w-xl mb-6" style={{ textAlign: 'left' }}>
        <span style={{ fontSize: 12, color: '#6b7280', fontFamily: 'monospace', fontWeight: 400 }}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>
    </>
  );
};

export default VideoPlayer;
