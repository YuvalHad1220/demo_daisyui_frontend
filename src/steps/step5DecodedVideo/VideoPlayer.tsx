import React, { useRef } from 'react';
import HlsPlayer from '../../components/ui/HlsPlayer';
import type { HlsPlayerRef } from '../../components/ui/HlsPlayer';

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
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  decodingState: 'initial' | 'decoding' | 'error' | 'done';
  onScreenshot?: () => void;
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
  videoRef: externalVideoRef,
  decodingState,
  onScreenshot,
}) => {
  const hlsPlayerRef = useRef<HlsPlayerRef>(null);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Sync the videoRef with the HlsPlayer's internal video element
  React.useEffect(() => {
    if (hlsPlayerRef.current && externalVideoRef) {
      // Update the videoRef to point to the HlsPlayer's video element
      (externalVideoRef as any).current = hlsPlayerRef.current.videoElement;
    }
  }, [externalVideoRef]);

  // Decoding badge logic synced with decodingState
  const isDecodingInProgress = decodingState === 'decoding';
  const isDecodingFinished = decodingState === 'done';

  return (
    <>
      {/* Decoding badge above video */}
      <div className="w-full flex justify-center mb-2">
        {isDecodingInProgress && (
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: '#fef3c7' }}>
            <div className="w-4 h-4 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"></div>
            <span className="text-sm font-medium" style={{ color: '#d97706' }}>
              Decoding in progress...
            </span>
          </div>
        )}
        {isDecodingFinished && (
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: '#f0fdf4' }}>
            <svg className="w-4 h-4" style={{ color: '#22c55e' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-medium" style={{ color: '#22c55e' }}>
              Decoding finished
            </span>
          </div>
        )}
      </div>

      {/* Content Area - matching FileUpload design */}
      <div className="p-6 flex-1">
        <div className="aspect-video rounded-lg flex items-center justify-center overflow-hidden border max-w-4xl max-h-128 mx-auto" style={{ background: '#fdfcfb', borderColor: '#e8e6e3' }}>
          {decodedVideoUrl ? (
            <HlsPlayer
              ref={hlsPlayerRef}
              src={decodedVideoUrl}
              onTimeUpdate={onTimeUpdate}
              onLoadedMetadata={onLoadedMetadata}
              onPlay={onPlay}
              onPause={onPause}
              onEnded={onEnded}
              onError={onError}
              className="w-full h-full object-contain rounded-lg"
              controls
              autoPlay
            />
          ) : (
            <div className="flex flex-col items-center justify-center space-y-3 opacity-40">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f0fdfa' }}>
                <svg className="w-6 h-6" style={{ color: '#14b8a6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium" style={{ color: '#9ca3af' }}>
                Decoded Video
              </p>
            </div>
          )}
        </div>
        {/* Centered Screenshot Button */}
        {onScreenshot && (
          <div className="flex justify-center mt-6">
            <button
              className="btn btn-primary flex items-center space-x-2"
              type="button"
              onClick={onScreenshot}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h2a2 2 0 012 2v8a2 2 0 01-2 2H3m0-12v12m0-12h18m0 0v12m0-12a2 2 0 012 2v8a2 2 0 01-2 2h-2" />
              </svg>
              <span>Take Screenshot</span>
            </button>
          </div>
        )}
      </div>

      {/* Footer - centered time display */}
      <div className="px-6 pb-6 flex-shrink-0">
        <div className="w-full flex justify-center">
          <div className="max-w-4xl w-full" style={{ textAlign: 'left' }}>
            <span style={{ fontSize: 12, color: '#6b7280', fontFamily: 'monospace', fontWeight: 400 }}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default VideoPlayer;
