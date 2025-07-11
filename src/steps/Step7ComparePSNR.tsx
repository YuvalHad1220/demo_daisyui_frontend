import React, { useCallback } from 'react';
import { BarChart3 } from 'lucide-react';
import { ErrorAlert } from '../components/ui/ErrorAlert';
import { StageCard } from '../components/ui/StageCard';
import { useWorkflow } from '../hooks/WorkflowContext';
import HlsPlayer from '../components/ui/HlsPlayer';
import VideoControls from './step7ComparePsnr/VideoControls';
import PsnrComparisonGraph from './step7ComparePsnr/PsnrComparisonGraph';
import { codecNames, codecColors } from '../hooks/usePsnrComparison';

// A memoized component for the video player itself to prevent re-renders on PSNR updates.
const VideoDisplay = React.memo(({
  codec,
  videoRef,
  src,
  onTimeUpdate,
  onLoadedMetadata,
  handleVideoError,
  onHlsReady,
  onHlsBuffering,
  onVideoReady,
  onVideoBuffering,
}: any) => {
  const handleLoadedData = useCallback(() => onVideoReady(codec), [onVideoReady, codec]);
  const handleWaiting = useCallback(() => onVideoBuffering(codec, true), [onVideoBuffering, codec]);
  const handleCanPlay = useCallback(() => onVideoBuffering(codec, false), [onVideoBuffering, codec]);
  const onError = useCallback(() => handleVideoError(codec), [handleVideoError, codec]);

  return (
    <div className="aspect-video rounded-lg overflow-hidden border relative bg-gray-900">
      {codec === 'ours' ? (
        <HlsPlayer
          ref={videoRef}
          src={src}
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onLoadedMetadata}
          onError={onError}
          onReady={onHlsReady}
          onBuffering={onHlsBuffering}
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
          onError={onError}
          onLoadedData={handleLoadedData}
          onWaiting={handleWaiting}
          onCanPlay={handleCanPlay}
          muted
        />
      )}
    </div>
  );
});

// A separate component for the overlay to allow PSNR to update without re-rendering the player.
const VideoOverlay = ({ codec, psnr, getQualityColor }: any) => (
  <>
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
  </>
);


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
            {Object.keys(codecNames).map((codec) => (
              <div key={codec} className="relative">
                <div className="aspect-video rounded-lg overflow-hidden border relative flex items-center justify-center" style={{ background: '#fdfcfb', borderColor: '#e5e7eb' }}>
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"></div>
                    <span className="text-sm font-medium" style={{ color: '#6b7280' }}>
                      Loading {codecNames[codec]}...
                    </span>
                  </div>
                </div>
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
      {error && (
        <div className="mx-6 mt-4">
          <ErrorAlert title="Playback Error" message={error} />
        </div>
      )}

      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          {Object.keys(videoUrls).map((codec) => (
            <div key={codec} className="relative">
              <VideoDisplay
                codec={codec}
                videoRef={videoRefs[codec as keyof typeof videoRefs]}
                src={videoUrls[codec]}
                onTimeUpdate={handleVideoTimeUpdate}
                onLoadedMetadata={handleVideoLoadedMetadata}
                handleVideoError={handleVideoError}
                onHlsReady={handleHlsReady}
                onHlsBuffering={handleHlsBuffering}
                onVideoReady={handleVideoReady}
                onVideoBuffering={handleVideoBuffering}
              />
              <VideoOverlay
                codec={codec}
                psnr={psnrData[codec]}
                getQualityColor={getQualityColor}
              />
            </div>
          ))}
        </div>

        <VideoControls
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          allVideosLoaded={allVideosLoaded}
          handlePlayPause={handlePlayPause}
          handleSkip={handleSkip}
          handleScrubberChange={handleScrubberChange}
        />

        <PsnrComparisonGraph psnrData={psnrData} />
      </div>
    </StageCard>
  );
};

export default Step7ComparePSNR;