import React, { useRef } from 'react';
import { AlertCircle } from 'lucide-react';
import HlsPlayer from '../../components/ui/HlsPlayer';
import type { HlsPlayerRef } from '../../components/ui/HlsPlayer';

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
  const hlsPlayerRef = useRef<HlsPlayerRef>(null);

  const formatTime = (sec: number) => {
    if (!isFinite(sec) || sec < 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Sync the videoRef with the HlsPlayer's internal video element
  React.useEffect(() => {
    if (hlsPlayerRef.current && videoRef) {
      // Update the videoRef to point to the HlsPlayer's video element
      (videoRef as any).current = hlsPlayerRef.current.videoElement;
    }
  }, [videoRef]);

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

      <div className="w-full flex justify-center mb-2">
        <div className="max-w-xl aspect-video rounded-lg flex items-center justify-center overflow-hidden border" style={{ background: '#fdfcfb', borderColor: '#e8e6e3' }}>
          <HlsPlayer
            ref={hlsPlayerRef}
            src={decodedVideoUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onError={setError}
            className="w-full h-full object-contain rounded-lg"
            style={{ background: '#fdfcfb' }}
            controls
          />
        </div>
      </div>
      
      <div className="w-full flex justify-center mb-6">
        <div className="max-w-xl" style={{ textAlign: 'left' }}>
          <span style={{ fontSize: 12, color: '#6b7280', fontFamily: 'monospace', fontWeight: 400 }}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      </div>
    </>
  );
};

export default VideoPlayerSection;
