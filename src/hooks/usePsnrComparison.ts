import { useState, useCallback, useMemo, useEffect, RefObject } from 'react';

export type PsnrComparisonState = 'loading' | 'ready' | 'error';

export interface CodecVideoRefs {
  ours: RefObject<HTMLVideoElement>;
  h264: RefObject<HTMLVideoElement>;
  h265: RefObject<HTMLVideoElement>;
  av1: RefObject<HTMLVideoElement>;
}

export const videoUrls: Record<string, string> = {
  ours: 'https://www.w3schools.com/html/mov_bbb.mp4',
  h264: 'https://www.w3schools.com/html/mov_bbb.mp4',
  h265: 'https://www.w3schools.com/html/mov_bbb.mp4',
  av1: 'https://www.w3schools.com/html/mov_bbb.mp4'
};

export const codecColors: Record<string, { bg: string; border: string; text: string }> = {
  ours: { bg: '#14b8a6', border: '#0d9488', text: '#ffffff' },
  h264: { bg: '#2563eb', border: '#1d4ed8', text: '#ffffff' },
  h265: { bg: '#7c3aed', border: '#6d28d9', text: '#ffffff' },
  av1: { bg: '#dc2626', border: '#b91c1c', text: '#ffffff' }
};

export const codecNames: Record<string, string> = {
  ours: 'Our Codec',
  h264: 'H.264',
  h265: 'H.265',
  av1: 'AV1'
};

interface UsePsnrComparisonReturn {
  psnrState: PsnrComparisonState;
  error: string;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  loadingStates: Record<string, boolean>;
  psnrData: Record<string, number>;
  allVideosLoaded: boolean;
  handlePlayPause: () => void;
  handleSkip: (direction: 'forward' | 'backward') => void;
  handleScrubberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleVideoTimeUpdate: () => void;
  handleVideoLoadedMetadata: () => void;
  handleReset: () => void;
  setError: (message: string) => void;
}

export const usePsnrComparison = (videoRefs: CodecVideoRefs): UsePsnrComparisonReturn => {
  const [psnrState, setPsnrState] = useState<PsnrComparisonState>('loading');
  const [error, setError] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(60);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({
    ours: true,
    h264: true,
    h265: true,
    av1: true
  });
  const [psnrData, setPsnrData] = useState<Record<string, number>>({
    ours: 42.3,
    h264: 38.7,
    h265: 41.2,
    av1: 43.8
  });

  const allVideosLoaded = useMemo(() => !Object.values(loadingStates).some(loading => loading), [loadingStates]);

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
    if (allVideosLoaded) {
        setPsnrState('ready');
    }
  }, [allVideosLoaded]);

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

  const handlePlayPause = useCallback(() => {
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
  }, [isPlaying, videoRefs]);

  const handleSkip = useCallback((direction: 'forward' | 'backward') => {
    const skipTime = direction === 'forward' ? 10 : -10;
    const newTime = Math.max(0, Math.min(duration, currentTime + skipTime));
    setCurrentTime(newTime);
    Object.values(videoRefs).forEach(ref => {
      if (ref.current) {
        ref.current.currentTime = newTime;
      }
    });
  }, [currentTime, duration, videoRefs]);

  const handleScrubberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    Object.values(videoRefs).forEach(ref => {
      if (ref.current) {
        ref.current.currentTime = newTime;
      }
    });
  }, [videoRefs]);

  const handleVideoTimeUpdate = useCallback(() => {
    if (videoRefs.ours.current) {
      setCurrentTime(videoRefs.ours.current.currentTime);
    }
  }, [videoRefs.ours]);

  const handleVideoLoadedMetadata = useCallback(() => {
    if (videoRefs.ours.current) {
      setDuration(videoRefs.ours.current.duration);
    }
  }, [videoRefs.ours]);

  const handleReset = useCallback(() => {
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
    setPsnrState('loading');

    Object.values(videoRefs).forEach(ref => {
      if (ref.current) {
        ref.current.pause();
        ref.current.currentTime = 0;
      }
    });
  }, [videoRefs]);

  return useMemo(() => ({
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
    setError,
  }), [
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
  ]);
};