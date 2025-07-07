import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, BarChart3, AlertCircle, Loader, ChevronDown, ChevronUp } from 'lucide-react';
import { StageCard } from '../components/ui/StageCard';
import { Tooltip } from '../components/ui/Tooltip';

const Step7ComparePSNR = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(60);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({
    ours: true,
    h264: true,
    h265: true,
    av1: true
  });
  const [error, setError] = useState<string>('');
  const [showPSNRComparison, setShowPSNRComparison] = useState<boolean>(false);

  const videoRefs = {
    ours: useRef<HTMLVideoElement | null>(null),
    h264: useRef<HTMLVideoElement | null>(null),
    h265: useRef<HTMLVideoElement | null>(null),
    av1: useRef<HTMLVideoElement | null>(null)
  };

  const scrubberRef = useRef<HTMLInputElement | null>(null);

  // Simulated video URLs for different codecs
  const videoUrls: Record<string, string> = {
    ours: 'https://www.w3schools.com/html/mov_bbb.mp4',
    h264: 'https://www.w3schools.com/html/mov_bbb.mp4',
    h265: 'https://www.w3schools.com/html/mov_bbb.mp4',
    av1: 'https://www.w3schools.com/html/mov_bbb.mp4'
  };

  // Simulated PSNR data (real-time values)
  const [psnrData, setPsnrData] = useState<Record<string, number>>({
    ours: 42.3,
    h264: 38.7,
    h265: 41.2,
    av1: 43.8
  });

  // Color scheme for codecs
  const codecColors: Record<string, { bg: string; border: string; text: string }> = {
    ours: { bg: '#14b8a6', border: '#0d9488', text: '#ffffff' },
    h264: { bg: '#2563eb', border: '#1d4ed8', text: '#ffffff' },
    h265: { bg: '#7c3aed', border: '#6d28d9', text: '#ffffff' },
    av1: { bg: '#dc2626', border: '#b91c1c', text: '#ffffff' }
  };

  const codecNames: Record<string, string> = {
    ours: 'Our Codec',
    h264: 'H.264',
    h265: 'H.265',
    av1: 'AV1'
  };

  useEffect(() => {
    // Simulate loading states
    const timers = Object.keys(loadingStates).map((codec, index) => 
      setTimeout(() => {
        setLoadingStates(prev => ({ ...prev, [codec]: false }));
      }, 1000 + index * 500)
    );

    return () => timers.forEach(timer => clearTimeout(timer));
  }, []);

  useEffect(() => {
    // Update PSNR values in real-time
    const interval = setInterval(() => {
      if (isPlaying) {
        setPsnrData(prev => ({
          ours: prev.ours + (Math.random() - 0.5) * 0.5,
          h264: prev.h264 + (Math.random() - 0.5) * 0.5,
          h265: prev.h265 + (Math.random() - 0.5) * 0.5,
          av1: prev.av1 + (Math.random() - 0.5) * 0.5
        }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const handlePlayPause = () => {
    const newPlayingState = !isPlaying;
    setIsPlaying(newPlayingState);
    Object.values(videoRefs).forEach(ref => {
      if (ref.current) {
        if (newPlayingState) {
          ref.current.play();
        } else {
          ref.current.pause();
        }
      }
    });
  };

  const handleSkip = (direction: 'forward' | 'backward') => {
    const skipTime = direction === 'forward' ? 10 : -10;
    const newTime = Math.max(0, Math.min(duration, currentTime + skipTime));
    setCurrentTime(newTime);
    Object.values(videoRefs).forEach(ref => {
      if (ref.current) {
        ref.current.currentTime = newTime;
      }
    });
  };

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    Object.values(videoRefs).forEach(ref => {
      if (ref.current) {
        ref.current.currentTime = newTime;
      }
    });
  };

  const handleVideoTimeUpdate = () => {
    if (videoRefs.ours.current) {
      setCurrentTime(videoRefs.ours.current.currentTime);
    }
  };

  const handleVideoLoadedMetadata = () => {
    if (videoRefs.ours.current) {
      setDuration(videoRefs.ours.current.duration);
    }
  };

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

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setLoadingStates({
      ours: true,
      h264: true,
      h265: true,
      av1: true
    });
    setPsnrData({
      ours: 42.3,
      h264: 38.7,
      h265: 41.2,
      av1: 43.8
    });
    setError('');
    setShowPSNRComparison(true);
    
    // Reset all video players
    Object.values(videoRefs).forEach(ref => {
      if (ref.current) {
        ref.current.pause();
        ref.current.currentTime = 0;
      }
    });
  };

  const allVideosLoaded = !Object.values(loadingStates).some(loading => loading);

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
          <div className="mx-6 mt-4 flex items-start space-x-3 p-4 rounded-lg border" style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#fee2e2' }}>
              <AlertCircle className="w-4 h-4" style={{ color: '#ef4444' }} />
            </div>
            <div>
              <p className="font-semibold" style={{ color: '#dc2626' }}>Playback Error</p>
              <p className="text-sm" style={{ color: '#991b1b' }}>{error}</p>
            </div>
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