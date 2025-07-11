import React, { useRef } from 'react';
import { BarChart3 } from 'lucide-react';
import { ErrorAlert } from '../components/ui/ErrorAlert';
import { StageCard } from '../components/ui/StageCard';
import { useWorkflow } from '../hooks/WorkflowContext';
// import HlsPlayer from '../components/ui/HlsPlayer';
import VideoControls from './step7ComparePsnr/VideoControls';
import PsnrComparisonGraph from './step7ComparePsnr/PsnrComparisonGraph';
import { codecNames, codecColors } from '../hooks/usePsnrComparison';

const Step7ComparePSNR: React.FC<{ onResetGroup: () => void; isFirstStepInGroup: boolean }> = ({ onResetGroup, isFirstStepInGroup }) => {
  const { psnrComparison, fileUpload } = useWorkflow();

  const {
    error,
    isPlaying,
    currentTime,
    duration,
    loadingStates,
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
    // FIXED: Use new synchronization handlers
    // handleHlsReady,
    // handleHlsBuffering,
    handleVideoReady,
    handleVideoBuffering,
  } = psnrComparison;

  const handleResetClick = () => {
    psnrComparisonReset();
    onResetGroup();
  };

  const getQualityColor = (psnr: number) => {
    if (psnr >= 40) return '#22c55e';
    if (psnr >= 35) return '#f59e42';
    return '#ef4444';
  };

  // FIXED: Enhanced event handlers for regular videos
  const handleVideoLoadedData = (codec: string) => {
    handleVideoReady(codec);
  };

  const handleVideoWaiting = (codec: string) => {
    handleVideoBuffering(codec, true);
  };

  const handleVideoCanPlay = (codec: string) => {
    handleVideoBuffering(codec, false);
  };

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
            {/* {['ours', 'h264', 'h265', 'av1'].map((codec) => ( */}
            {['h264', 'h265', 'av1'].map((codec) => (
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
          {/* Ours - HLS Player */}
          {/* <div className="relative">
            <div className="aspect-video rounded-lg overflow-hidden border relative" style={{ background: '#fdfcfb', borderColor: '#e5e7eb' }}>
              <HlsPlayer
                ref={videoRefs.ours}
                src={videoUrls.ours}
                onTimeUpdate={handleVideoTimeUpdate}
                onLoadedMetadata={handleVideoLoadedMetadata}
                onError={() => setError(`Failed to load ${codecNames.ours} video.`)}
                // FIXED: Add synchronization event handlers
                onReady={handleHlsReady}
                onBuffering={handleHlsBuffering}
                className="w-full h-full object-contain"
                muted
                controls={false}
              />
            </div>
            
            // Codec Label
            <div className="absolute top-2 left-2">
              <span 
                className="px-2 py-1 rounded text-xs font-semibold"
                style={{ 
                  backgroundColor: codecColors.ours.bg,
                  color: codecColors.ours.text
                }}
              >
                {codecNames.ours}
              </span>
            </div>

            // PSNR Display
            <div className="absolute top-2 right-2">
              <div 
                className="px-2 py-1 rounded text-xs font-semibold"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  color: getQualityColor(psnrData.ours)
                }}
              >
                {psnrData.ours.toFixed(1)} dB
              </div>
            </div>
          </div> */}

          {/* H264 - Regular Video */}
          <div className="relative">
            <div className="aspect-video rounded-lg overflow-hidden border relative" style={{ background: '#fdfcfb', borderColor: '#e5e7eb' }}>
              <video
                ref={videoRefs.h264}
                src={videoUrls.h264}
                className="w-full h-full object-contain"
                onTimeUpdate={handleVideoTimeUpdate}
                onLoadedMetadata={handleVideoLoadedMetadata}
                onError={() => setError(`Failed to load ${codecNames.h264} video.`)}
                // FIXED: Add synchronization event handlers
                onLoadedData={() => handleVideoLoadedData('h264')}
                onWaiting={() => handleVideoWaiting('h264')}
                onCanPlay={() => handleVideoCanPlay('h264')}
                muted
              />
            </div>
            
            {/* Codec Label */}
            <div className="absolute top-2 left-2">
              <span 
                className="px-2 py-1 rounded text-xs font-semibold"
                style={{ 
                  backgroundColor: codecColors.h264.bg,
                  color: codecColors.h264.text
                }}
              >
                {codecNames.h264}
              </span>
            </div>

            {/* PSNR Display */}
            <div className="absolute top-2 right-2">
              <div 
                className="px-2 py-1 rounded text-xs font-semibold"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  color: getQualityColor(psnrData.h264)
                }}
              >
                {psnrData.h264.toFixed(1)} dB
              </div>
            </div>
          </div>

          {/* H265 - Regular Video */}
          <div className="relative">
            <div className="aspect-video rounded-lg overflow-hidden border relative" style={{ background: '#fdfcfb', borderColor: '#e5e7eb' }}>
              <video
                ref={videoRefs.h265}
                src={videoUrls.h265}
                className="w-full h-full object-contain"
                onTimeUpdate={handleVideoTimeUpdate}
                onLoadedMetadata={handleVideoLoadedMetadata}
                onError={() => setError(`Failed to load ${codecNames.h265} video.`)}
                // FIXED: Add synchronization event handlers
                onLoadedData={() => handleVideoLoadedData('h265')}
                onWaiting={() => handleVideoWaiting('h265')}
                onCanPlay={() => handleVideoCanPlay('h265')}
                muted
              />
            </div>
            
            {/* Codec Label */}
            <div className="absolute top-2 left-2">
              <span 
                className="px-2 py-1 rounded text-xs font-semibold"
                style={{ 
                  backgroundColor: codecColors.h265.bg,
                  color: codecColors.h265.text
                }}
              >
                {codecNames.h265}
              </span>
            </div>

            {/* PSNR Display */}
            <div className="absolute top-2 right-2">
              <div 
                className="px-2 py-1 rounded text-xs font-semibold"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  color: getQualityColor(psnrData.h265)
                }}
              >
                {psnrData.h265.toFixed(1)} dB
              </div>
            </div>
          </div>

          {/* AV1 - Regular Video */}
          <div className="relative">
            <div className="aspect-video rounded-lg overflow-hidden border relative" style={{ background: '#fdfcfb', borderColor: '#e5e7eb' }}>
              <video
                ref={videoRefs.av1}
                src={videoUrls.av1}
                className="w-full h-full object-contain"
                onTimeUpdate={handleVideoTimeUpdate}
                onLoadedMetadata={handleVideoLoadedMetadata}
                onError={() => setError(`Failed to load ${codecNames.av1} video.`)}
                // FIXED: Add synchronization event handlers
                onLoadedData={() => handleVideoLoadedData('av1')}
                onWaiting={() => handleVideoWaiting('av1')}
                onCanPlay={() => handleVideoCanPlay('av1')}
                muted
              />
            </div>
            
            {/* Codec Label */}
            <div className="absolute top-2 left-2">
              <span 
                className="px-2 py-1 rounded text-xs font-semibold"
                style={{ 
                  backgroundColor: codecColors.av1.bg,
                  color: codecColors.av1.text
                }}
              >
                {codecNames.av1}
              </span>
            </div>

            {/* PSNR Display */}
            <div className="absolute top-2 right-2">
              <div 
                className="px-2 py-1 rounded text-xs font-semibold"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  color: getQualityColor(psnrData.av1)
                }}
              >
                {psnrData.av1.toFixed(1)} dB
              </div>
            </div>
          </div>
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