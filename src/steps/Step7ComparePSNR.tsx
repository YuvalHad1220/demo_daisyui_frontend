import React, { useState, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, BarChart3, Loader, ChevronDown, ChevronUp } from 'lucide-react';
import { ErrorAlert } from '../components/ui/ErrorAlert';
import { StageCard } from '../components/ui/StageCard';
import { Tooltip } from '../components/ui/Tooltip';
import { usePsnrComparison, videoUrls, codecNames, codecColors } from '../hooks/usePsnrComparison';

const Step7ComparePSNR = () => {
  const videoRefs = {
    ours: useRef<HTMLVideoElement | null>(null),
    h264: useRef<HTMLVideoElement | null>(null),
    h265: useRef<HTMLVideoElement | null>(null),
    av1: useRef<HTMLVideoElement | null>(null)
  };

  const {
    psnrState,
    error,
    isPlaying,
    currentTime,
    duration,
    loadingStates,
    psnrData,
    allVideosLoaded,
    handlePlayPause,
    handleSkip,
    handleScrubberChange,
    handleVideoTimeUpdate,
    handleVideoLoadedMetadata,
    handleReset,
    setError
  } = usePsnrComparison(videoRefs);

  const [showPSNRComparison, setShowPSNRComparison] = useState<boolean>(false);
  const scrubberRef = useRef<HTMLInputElement | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getQualityColor = (psnr: number) => {
    if (psnr >= 40) return '#22c55e';
    if (psnr >= 35) return '#f59e42';
    return '#ef4444';
  };

  

  return (
    <StageCard
      title="Compare PSNR"
      icon={BarChart3}
      showReset={allVideosLoaded}
      resetTitle="Reset Comparison"
      onResetClick={handleReset}
    >

        {/* Error Display */}
        {error && (
          <div className="mx-6 mt-4">
            <ErrorAlert title="Playback Error" message={error} />
          </div>
        )}

        {/* Video Players Grid */}
        <div className="p-6 flex-1 overflow-auto">
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

          {/* Universal Scrubber */}
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
                  ref={scrubberRef}
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

          {/* PSNR Comparison Graph - Collapsible */}
          <div className="rounded-lg border" style={{ background: '#fdfcfb', borderColor: '#e8e6e3' }}>
            <button
              onClick={() => setShowPSNRComparison(!showPSNRComparison)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-100 transition-colors"
            >
              <h3 className="font-semibold text-lg" style={{ color: '#111827' }}>
                PSNR Comparison
              </h3>
              {showPSNRComparison ? (
                <ChevronUp className="w-5 h-5" style={{ color: '#14b8a6' }} />
              ) : (
                <ChevronDown className="w-5 h-5" style={{ color: '#14b8a6' }} />
              )}
            </button>
            
            {showPSNRComparison && (
              <div className="px-6 pb-6 animate-fade-in">
                <div className="space-y-4">
                  {Object.entries(psnrData).map(([codec, psnr]) => (
                    <div key={codec} className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2" style={{ minWidth: '100px' }}>
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: codecColors[codec].bg }}
                        />
                        <span className="text-sm font-medium" style={{ color: '#111827' }}>
                          {codecNames[codec]}
                        </span>
                      </div>
                      
                      <div className="flex-1 h-4 bg-gray-200 rounded-full relative">
                        <div
                          className="h-4 rounded-full transition-all duration-300"
                          style={{
                            backgroundColor: codecColors[codec].bg,
                            width: `${Math.min((psnr / 50) * 100, 100)}%`
                          }}
                        />
                      </div>
                      
                      <span 
                        className="text-sm font-semibold"
                        style={{ 
                          color: codecColors[codec].bg,
                          minWidth: '60px',
                          textAlign: 'right'
                        }}
                      >
                        {psnr.toFixed(1)} dB
                      </span>
                    </div>
                  ))}
                </div>
                
                {/* Codec Legend */}
                <div className="mt-6 pt-4 border-t flex items-center justify-center space-x-6" style={{ borderColor: '#e5e7eb' }}>
                  {Object.entries(codecColors).map(([codec, colors]) => (
                    <div key={codec} className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: colors.bg }} 
                      />
                      <span className="text-xs" style={{ color: '#6b7280' }}>
                        {codecNames[codec]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
    </StageCard>
  );
};

export default Step7ComparePSNR; 