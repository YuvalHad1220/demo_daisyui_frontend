import React, { useCallback } from 'react';
import { BarChart3 } from 'lucide-react';
import { ErrorAlert } from '../components/ui/ErrorAlert';
import { StageCard } from '../components/ui/StageCard';
import { useWorkflow } from '../hooks/WorkflowContext';
import HlsPlayer from '../components/ui/HlsPlayer';
import VideoControls from './step7ComparePsnr/VideoControls';
import PsnrComparisonGraph from './step7ComparePsnr/PsnrComparisonGraph';
import { codecNames, codecColors } from '../hooks/usePsnrComparison';

// Memoized Video Player Component
const VideoPlayer = React.memo(({
  codec,
  videoRef,
  src,
  psnr,
  getQualityColor,
  onTimeUpdate,
  onLoadedMetadata,
  onError,
  onReady,
  onBuffering,
  onVideoReady,
  onVideoBuffering,
}: any) => {

  const handleLoadedData = useCallback(() => onVideoReady(codec), [onVideoReady, codec]);
  const handleWaiting = useCallback(() => onVideoBuffering(codec, true), [onVideoBuffering, codec]);
  const handleCanPlay = useCallback(() => onVideoBuffering(codec, false), [onVideoBuffering, codec]);
  const handleError = useCallback(() => onError(codec), [onError, codec]);

  return (
    <div className="relative">
      <div className="aspect-video rounded-lg overflow-hidden border relative" style={{ background: '#fdfcfb', borderColor: '#e5e7eb' }}>
        {codec === 'ours' ? (
          <HlsPlayer
            ref={videoRef}
            src={src}
            onTimeUpdate={onTimeUpdate}
            onLoadedMetadata={onLoadedMetadata}
            onError={handleError}
            onReady={onReady}
            onBuffering={onBuffering}
            className="w-full h-full object-contain"
            muted
            controls={false}
          />
        ) : (
          <video
            ref={videoRef}
            src={src}
            className="w-full h-full object-contain"
            onTimeUpdate={onTimeUpdate}
            onLoadedMetadata={onLoadedMetadata}
            onError={handleError}
            onLoadedData={handleLoadedData}
            onWaiting={handleWaiting}
            onCanPlay={handleCanPlay}
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
            color: getQualityColor(psnr)
          }}
        >
          {psnr.toFixed(1)} dB
        </div>
      </div>
    </div>
  );
});

const Step7ComparePSNR: React.FC<{ onResetGroup: () => void; isFirstStepInGroup: boolean }> = ({ onResetGroup, isFirstStepInGroup }) => {
  const { psnrComparison } = useWorkflow();

  const {
    error,
    isPlaying,
    currentTime,
    duration,
    psnrData,
    allVideosLoaded,
    videoUrls,
    videoRefs,
    handlePlayPause,
    handleSkip,
    handleScrubberChange,
    handleVideoTimeUpdate,
    handleVideoLoadedMetadata,
    handleReset: psnrComparisonReset,
    setError,
    handleHlsReady,
    handleHlsBuffering,
    handleVideoReady,
    handleVideoBuffering,
  } = psnrComparison;

  const handleResetClick = () => {
    psnrComparisonReset();
    onResetGroup();
  };

  const getQualityColor = useCallback((psnr: number) => {
    if (psnr >= 40) return '#22c55e';
    if (psnr >= 35) return '#f59e42';
    return '#ef4444';
  }, []);

  const handleVideoError = useCallback((codec: string) => {
    setError(`Failed to load ${codecNames[codec]} video.`);
  }, [setError]);

  // Show loading state until all videos are loaded
  if (!allVideosLoaded) {
    return (
      <StageCard
        title="Compare PSNR"
        icon={BarChart3}
        showReset={isFirstStepInGroup}
        resetTitle="Reset Comparison"
        onResetClick={handleResetClick}
      >
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            {['ours', 'h264', 'h265', 'av1'].map((codec) => (
              <div key={codec} className="relative">
                <div className="aspect-video rounded-lg overflow-hidden border relative" style={{ background: '#fdfcfb', borderColor: '#e5e7eb' }}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"></div>
                      <span className="text-sm font-medium" style={{ color: '#6b7280' }}>
                        Loading {codecNames[codec]}...
                      </span>
                    </div>
                  </div>
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
              </div>
            ))}
          </div>
        </div>
      </StageCard>
    );
  }

  return (
    <StageCard
      title="Compare PSNR"
      icon={BarChart3}
      showReset={isFirstStepInGroup}
      resetTitle="Reset Comparison"
      onResetClick={handleResetClick}
    >
      {/* Error Display */}
      {error && (
        <div className="mx-6 mt-4">
          <ErrorAlert title="Playback Error" message={error} />
        </div>
      )}

      {/* Video Players Grid */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          {Object.keys(videoUrls).map((codec) => (
            <VideoPlayer
              key={codec}
              codec={codec}
              videoRef={videoRefs[codec as keyof typeof videoRefs]}
              src={videoUrls[codec]}
              psnr={psnrData[codec]}
              getQualityColor={getQualityColor}
              onTimeUpdate={handleVideoTimeUpdate}
              onLoadedMetadata={handleVideoLoadedMetadata}
              onError={handleVideoError}
              onReady={handleHlsReady}
              onBuffering={handleHlsBuffering}
              onVideoReady={handleVideoReady}
              onVideoBuffering={handleVideoBuffering}
            />
          ))}
        </div>

        {/* Universal Scrubber and Controls */}
        <VideoControls
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          allVideosLoaded={allVideosLoaded}
          handlePlayPause={handlePlayPause}
          handleSkip={handleSkip}
          handleScrubberChange={handleScrubberChange}
        />

        {/* PSNR Comparison Graph - Collapsible */}
        <PsnrComparisonGraph psnrData={psnrData} />
      </div>
    </StageCard>
  );
};

export default Step7ComparePSNR;