import React, { useRef, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import Hls from 'hls.js';

interface VideoPlayerSectionProps {
  error: string;
  searchError: string;
  decodedVideoUrl: string;
  currentTime: number;
  duration: number;
  handleTimeUpdate: () => void;
  handleLoadedMetadata: () => void;
  setError: (message: string) => void;
  videoRef: React.RefObject<HTMLVideoElement>;
}

const VideoPlayerSection: React.FC<VideoPlayerSectionProps> = ({
  error,
  searchError,
  decodedVideoUrl,
  currentTime,
  duration,
  handleTimeUpdate,
  handleLoadedMetadata,
  setError,
  videoRef,
}) => {
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // HLS.js support
  useEffect(() => {
    let hls: Hls | null = null;
    const video = videoRef.current;
    if (decodedVideoUrl && decodedVideoUrl.endsWith('.m3u8') && video) {
      if (Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(decodedVideoUrl);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = decodedVideoUrl;
      }
    }
    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [decodedVideoUrl, videoRef]);

  return (
    <>
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

      {searchError && (
        <div className="w-full mb-4">
          <div className="flex items-start space-x-3 p-4 rounded-lg border" style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#fee2e2' }}>
              <AlertCircle className="w-4 h-4" style={{ color: '#ef4444' }} />
            </div>
            <div>
              <p className="font-semibold" style={{ color: '#dc2626' }}>Search Error</p>
              <p className="text-sm" style={{ color: '#991b1b' }}>{searchError}</p>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-xl aspect-video rounded-lg flex items-center justify-center overflow-hidden border mb-2" style={{ background: '#fdfcfb', borderColor: '#e8e6e3' }}>
        <video
          ref={videoRef}
          // src is set by HLS.js or natively if not HLS
          className="w-full h-full object-contain rounded-lg"
          controls
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onError={() => setError('Failed to load video.')}
          style={{ background: '#fdfcfb' }}
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

export default VideoPlayerSection;
