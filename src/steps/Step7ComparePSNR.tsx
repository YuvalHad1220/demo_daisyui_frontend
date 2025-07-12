import React, { useCallback, useMemo, useState } from 'react';
import { BarChart3, Maximize } from 'lucide-react';
import { ErrorAlert } from '../components/ui/ErrorAlert';
import { StageCard } from '../components/ui/StageCard';
import { useWorkflow } from '../hooks/useWorkflow';
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
  compressionRatio,
  showLoadingOverlay,
  isVideoReady,
  onRetryVideo,
}: any) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const handleLoadedData = useCallback(() => onVideoReady(codec), [onVideoReady, codec]);
  const handleWaiting = useCallback(() => onVideoBuffering(codec, true), [onVideoBuffering, codec]);
  const handleCanPlay = useCallback(() => onVideoBuffering(codec, false), [onVideoBuffering, codec]);
  const onError = useCallback(() => handleVideoError(codec), [handleVideoError, codec]);

  const handleFullscreen = useCallback(() => {
    const videoElement = codec === 'ours' ? videoRef.current?.videoElement : videoRef.current;
    if (!videoElement) return;

    if (!isFullscreen) {
      if (videoElement.requestFullscreen) {
        videoElement.requestFullscreen();
      } else if ((videoElement as any).webkitRequestFullscreen) {
        (videoElement as any).webkitRequestFullscreen();
      } else if ((videoElement as any).mozRequestFullScreen) {
        (videoElement as any).mozRequestFullScreen();
      } else if ((videoElement as any).msRequestFullscreen) {
        (videoElement as any).msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  }, [codec, videoRef, isFullscreen]);

  // Listen for fullscreen change events
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

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
          compressionRatio={compressionRatio}
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
      
      {/* Loading overlay */}
      {showLoadingOverlay && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-20">
          {isVideoReady ? (
            // All videos not ready, but this one is
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              <span className="text-white text-sm font-medium">Waiting for other videos...</span>
            </div>
          ) : (
            // This specific video is not ready
            <div className="flex flex-col items-center space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 animate-spin rounded-full border-2 border-red-400 border-t-transparent"></div>
                <span className="text-white text-sm font-medium">{codecNames[codec]} not ready</span>
              </div>
              <button
                onClick={() => onRetryVideo(codec)}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-md transition-colors"
              >
                Retry Reload
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Fullscreen button */}
      <button
        onClick={handleFullscreen}
        className="absolute bottom-2 right-2 p-2 rounded-lg bg-black bg-opacity-70 hover:bg-opacity-90 transition-all duration-200 text-white z-10"
        title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        disabled={showLoadingOverlay}
      >
        <Maximize className="w-4 h-4" />
      </button>
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
    allVideosReadyIncludingHls,
    individualVideoReady,
    videoUrls,
    videoRefs,
    compressionRatio, // Get compression ratio from the hook
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
    handleRetryVideo,
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

  // Show initial loading state when h264, h265, av1 are not loaded yet
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
                  <div className="flex flex-col items-center space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"></div>
                      <span className="text-sm font-medium" style={{ color: '#6b7280' }}>
                        Loading {codecNames[codec]}...
                      </span>
                    </div>
                    <button
                      onClick={() => handleRetryVideo(codec)}
                      className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs rounded-md transition-colors"
                    >
                      Retry Load
                    </button>
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
                {/* Fullscreen button (disabled during loading) */}
                <button
                  disabled
                  className="absolute bottom-2 right-2 p-2 rounded-lg bg-black bg-opacity-30 text-white cursor-not-allowed z-10"
                  title="Fullscreen (unavailable while loading)"
                >
                  <Maximize className="w-4 h-4" />
                </button>
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
                compressionRatio={compressionRatio}
                showLoadingOverlay={!allVideosReadyIncludingHls}
                isVideoReady={individualVideoReady[codec]}
                onRetryVideo={handleRetryVideo}
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
          allVideosLoaded={allVideosReadyIncludingHls}
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