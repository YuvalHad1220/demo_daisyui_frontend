import React from 'react';
import { Loader } from 'lucide-react';
import { videoUrls, codecNames, codecColors } from '../../hooks/usePsnrComparison';

interface VideoPlayersGridProps {
  videoRefs: Record<string, React.RefObject<HTMLVideoElement>>;
  loadingStates: Record<string, boolean>;
  psnrData: Record<string, number>;
  handleVideoTimeUpdate: () => void;
  handleVideoLoadedMetadata: () => void;
  setError: (message: string) => void;
}

const VideoPlayersGrid: React.FC<VideoPlayersGridProps> = ({
  videoRefs,
  loadingStates,
  psnrData,
  handleVideoTimeUpdate,
  handleVideoLoadedMetadata,
  setError,
}) => {
  const getQualityColor = (psnr: number) => {
    if (psnr >= 40) return '#22c55e';
    if (psnr >= 35) return '#f59e42';
    return '#ef4444';
  };

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      {Object.entries(videoRefs).map(([codec, ref]) => (
        <div key={codec} className="relative">
          <div className="aspect-video bg-gray-50 rounded-lg overflow-hidden border relative" style={{ borderColor: '#e5e7eb' }}>
            {loadingStates[codec] ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex items-center space-x-2">
                  <Loader className="w-5 h-5 animate-spin" style={{ color: '#f59e42' }} />
                  <span className="text-sm font-medium" style={{ color: '#6b7280' }}>
                    Loading {codecNames[codec]}...
                  </span>
                </div>
              </div>
            ) : (
              <video
                ref={ref}
                src={videoUrls[codec]}
                className="w-full h-full object-contain"
                onTimeUpdate={handleVideoTimeUpdate}
                onLoadedMetadata={handleVideoLoadedMetadata}
                onError={() => setError(`Failed to load ${codecNames[codec]} video.`)}
                muted
              />
            )}
          </div>
          
          {/* Codec Label */}
          <div className="absolute top-2 left-2">
            <span 
              className="px-2 py-1 rounded text-xs font-semibold"
              style={{ 
                backgroundColor: codecColors[codec].bg,
                color: codecColors[codec].text
              }}
            >
              {codecNames[codec]}
            </span>
          </div>

          {/* PSNR Display */}
          <div className="absolute top-2 right-2">
            <div 
              className="px-2 py-1 rounded text-xs font-semibold"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                color: getQualityColor(psnrData[codec])
              }}
            >
              {psnrData[codec].toFixed(1)} dB
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VideoPlayersGrid;
