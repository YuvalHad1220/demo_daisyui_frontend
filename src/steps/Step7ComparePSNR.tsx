import React, { useRef } from 'react';
import { BarChart3 } from 'lucide-react';
import { ErrorAlert } from '../components/ui/ErrorAlert';
import { StageCard } from '../components/ui/StageCard';
import { usePsnrComparison } from '../hooks/usePsnrComparison';
import VideoPlayersGrid from './step7ComparePsnr/VideoPlayersGrid';
import VideoControls from './step7ComparePsnr/VideoControls';
import PsnrComparisonGraph from './step7ComparePsnr/PsnrComparisonGraph';

const Step7ComparePSNR = () => {
  const videoRefs = {
    ours: useRef<HTMLVideoElement | null>(null),
    h264: useRef<HTMLVideoElement | null>(null),
    h265: useRef<HTMLVideoElement | null>(null),
    av1: useRef<HTMLVideoElement | null>(null)
  };

  const {
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
          <VideoPlayersGrid
            videoRefs={videoRefs}
            loadingStates={loadingStates}
            psnrData={psnrData}
            handleVideoTimeUpdate={handleVideoTimeUpdate}
            handleVideoLoadedMetadata={handleVideoLoadedMetadata}
            setError={setError}
          />

          {/* Universal Scrubber and Controls */}
          <VideoControls
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
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