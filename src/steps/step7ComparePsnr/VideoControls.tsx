import React from 'react';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { Tooltip } from '../../components/ui/Tooltip';

interface VideoControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  allVideosLoaded: boolean;
  handlePlayPause: () => void;
  handleSkip: (direction: 'backward' | 'forward') => void;
  handleScrubberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const VideoControls: React.FC<VideoControlsProps> = ({
  isPlaying,
  currentTime,
  duration,
  allVideosLoaded,
  handlePlayPause,
  handleSkip,
  handleScrubberChange,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="mb-6">
      {/* Loading message */}
      {!allVideosLoaded && (
        <div className="mb-4 p-3 rounded-lg text-center" style={{ backgroundColor: '#fef3c7', border: '1px solid #f59e0b' }}>
          <span className="text-sm font-medium" style={{ color: '#d97706' }}>
            Loading videos... Playback will be enabled when all videos are ready.
          </span>
        </div>
      )}
      
      <div className="flex items-center space-x-4">
        <Tooltip content="Skip Backward 10s">
          <button
            onClick={() => handleSkip('backward')}
            disabled={!allVideosLoaded}
            className={`p-2 rounded-lg border transition-colors ${
              allVideosLoaded 
                ? 'hover:bg-gray-50' 
                : 'opacity-50 cursor-not-allowed'
            }`}
            style={{ borderColor: '#d1d5db' }}
          >
            <SkipBack className="w-5 h-5" style={{ color: '#6b7280' }} />
          </button>
        </Tooltip>
        
        <Tooltip content={isPlaying ? "Pause" : "Play"}>
          <button
            onClick={handlePlayPause}
            disabled={!allVideosLoaded}
            className={`p-3 rounded-lg border transition-colors ${
              allVideosLoaded 
                ? 'hover:bg-gray-50' 
                : 'opacity-50 cursor-not-allowed'
            }`}
            style={{ borderColor: '#d1d5db' }}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" style={{ color: '#14b8a6' }} />
            ) : (
              <Play className="w-6 h-6" style={{ color: '#14b8a6' }} />
            )}
          </button>
        </Tooltip>
        
        <Tooltip content="Skip Forward 10s">
          <button
            onClick={() => handleSkip('forward')}
            disabled={!allVideosLoaded}
            className={`p-2 rounded-lg border transition-colors ${
              allVideosLoaded 
                ? 'hover:bg-gray-50' 
                : 'opacity-50 cursor-not-allowed'
            }`}
            style={{ borderColor: '#d1d5db' }}
          >
            <SkipForward className="w-5 h-5" style={{ color: '#6b7280' }} />
          </button>
        </Tooltip>
        
        <div className="flex-1">
          <input
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            onChange={handleScrubberChange}
            disabled={!allVideosLoaded}
            className={`w-full h-2 rounded-lg appearance-none transition-all duration-150 ${
              allVideosLoaded ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
            }`}
            style={{
              background: `linear-gradient(to right, #f7eee6 0%, #f7eee6 ${(currentTime / duration) * 100}%, #e8e6e3 ${(currentTime / duration) * 100}%, #e8e6e3 100%)`
            }}
          />
        </div>
        
        <span className="text-sm font-mono" style={{ color: '#6b7280', minWidth: '60px' }}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>
    </div>
  );
};

export default VideoControls;
