import React from 'react';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { Tooltip } from '../../components/ui/Tooltip';

interface VideoControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  handlePlayPause: () => void;
  handleSkip: (direction: 'backward' | 'forward') => void;
  handleScrubberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const VideoControls: React.FC<VideoControlsProps> = ({
  isPlaying,
  currentTime,
  duration,
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
      <div className="flex items-center space-x-4">
        <Tooltip content="Skip Backward 10s">
          <button
            onClick={() => handleSkip('backward')}
            className="p-2 rounded-lg border hover:bg-gray-50 transition-colors"
            style={{ borderColor: '#d1d5db' }}
          >
            <SkipBack className="w-5 h-5" style={{ color: '#6b7280' }} />
          </button>
        </Tooltip>
        
        <Tooltip content={isPlaying ? "Pause" : "Play"}>
          <button
            onClick={handlePlayPause}
            className="p-3 rounded-lg border hover:bg-gray-50 transition-colors"
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
            className="p-2 rounded-lg border hover:bg-gray-50 transition-colors"
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
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer transition-all duration-150"
            style={{
              background: `linear-gradient(to right, #14b8a6 0%, #14b8a6 ${(currentTime / duration) * 100}%, #e5e7eb ${(currentTime / duration) * 100}%, #e5e7eb 100%)`
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
