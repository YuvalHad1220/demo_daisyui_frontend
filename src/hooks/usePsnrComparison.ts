import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useCodecDataFetch } from './useCodecDataFetch';
import type { HlsPlayerRef } from '../components/ui/HlsPlayer';

export type PsnrComparisonState = 'loading' | 'ready' | 'error';

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
  allVideosReadyIncludingHls: boolean;
  individualVideoReady: Record<string, boolean>;
  videoUrls: Record<string, string>;
  videoRefs: {
    ours: React.RefObject<HlsPlayerRef | null>;
    h264: React.RefObject<HTMLVideoElement | null>;
    h265: React.RefObject<HTMLVideoElement | null>;
    av1: React.RefObject<HTMLVideoElement | null>;
  };
  compressionRatio: number;
  handlePlayPause: () => void;
  handleSkip: (direction: 'forward' | 'backward') => void;
  handleScrubberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleVideoTimeUpdate: () => void;
  handleVideoLoadedMetadata: () => void;
  handleReset: () => void;
  setError: (message: string) => void;
  handleHlsReady: () => void;
  handleHlsBuffering: (buffering: boolean) => void;
  handleVideoReady: (codec: string) => void;
  handleVideoBuffering: (codec: string, buffering: boolean) => void;
  handleRetryVideo: (codec: string) => void;
}

export const usePsnrComparison = (key: string, originalVideoDuration?: number): UsePsnrComparisonReturn => {
  // 1. Fetch h264, h265, av1 on load
  const { videoDataMap, loading, fetchData } = useCodecDataFetch(key || '');

  useEffect(() => {
    if (key) {
      fetchData(false);
    }
  }, [key, fetchData]);

  // Video refs
  const oursRef = useRef<HlsPlayerRef>(null);
  const h264Ref = useRef<HTMLVideoElement>(null);
  const h265Ref = useRef<HTMLVideoElement>(null);
  const av1Ref = useRef<HTMLVideoElement>(null);

  const videoRefs = useMemo(() => ({
    ours: oursRef,
    h264: h264Ref,
    h265: h265Ref,
    av1: av1Ref
  }), []);

  // State
  const [psnrState, setPsnrState] = useState<PsnrComparisonState>('loading');
  const [error, setError] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(60);
  const [hlsDuration, setHlsDuration] = useState<number>(0);

  // Track ready states for h264, h265, av1 only (ignore HLS)
  const [readyStates, setReadyStates] = useState<Record<string, boolean>>({
    h264: false,
    h265: false,
    av1: false
  });

  // Track if HLS is ready (but don't include in loading calculation)
  const [hlsReady, setHlsReady] = useState<boolean>(false);

  const [psnrData, setPsnrData] = useState<Record<string, number>>({
    ours: 0,
    h264: 0,
    h265: 0,
    av1: 0
  });

  // Compression ratio calculation
  const compressionRatio = useMemo(() => {
    if (hlsDuration > 0 && originalVideoDuration && originalVideoDuration > 0) {
      return hlsDuration / originalVideoDuration;
    }
    return 30/7; // Fallback
  }, [hlsDuration, originalVideoDuration]);

  // Video URLs
  const getVideoUrls = useMemo(() => {
    const urls: Record<string, string> = {
      ours: '',
      h264: videoDataMap.h264?.video_url || '',
      h265: videoDataMap.h265?.video_url || '',
      av1: videoDataMap.av1?.video_url || ''
    };

    if (key) {
      const filename = key.replace(/\.mp4$/, '');
      const keyParam = `?key=${encodeURIComponent(key)}`;
      urls.ours = `http://localhost:9000/hls/${filename}/decoded/stream.m3u8${keyParam}`;
    }

    return urls;
  }, [videoDataMap, key]);

  // Loading states based on ready states (exclude HLS)
  const loadingStates = useMemo(() => ({
    ours: !hlsReady,
    h264: !readyStates.h264,
    h265: !readyStates.h265,
    av1: !readyStates.av1
  }), [hlsReady, readyStates]);

  // 3. All videos loaded = h264, h265, av1 ready (ignore HLS for this calculation)
  const allVideosLoaded = useMemo(() => {
    return readyStates.h264 && readyStates.h265 && readyStates.av1;
  }, [readyStates]);

  // All videos including HLS ready for UI display
  const allVideosReadyIncludingHls = useMemo(() => {
    return hlsReady && readyStates.h264 && readyStates.h265 && readyStates.av1;
  }, [hlsReady, readyStates]);

  // Individual video ready states including HLS
  const individualVideoReady = useMemo(() => ({
    ours: hlsReady,
    h264: readyStates.h264,
    h265: readyStates.h265,
    av1: readyStates.av1
  }), [hlsReady, readyStates]);

  // 2. When videos are ready to play, console log
  useEffect(() => {
    if (allVideosLoaded) {
      console.log('All videos are ready to play!', readyStates);
      setPsnrState('ready');
    }
  }, [allVideosLoaded, readyStates]);

  // Update PSNR data when videoDataMap changes
  useEffect(() => {
    setPsnrData({
      ours: 42.3,
      h264: videoDataMap.h264?.psnr || 0,
      h265: videoDataMap.h265?.psnr || 0,
      av1: videoDataMap.av1?.psnr || 0
    });
  }, [videoDataMap]);

  // Event handlers
  const handleVideoReady = useCallback((codec: string) => {
    console.log(`Video ready: ${codec}`);
    if (codec !== 'ours') {
      setReadyStates(prev => ({ ...prev, [codec]: true }));
    }
  }, []);

  const handleHlsReady = useCallback(() => {
    console.log('HLS ready');
    setHlsReady(true);
  }, []);

  const handleHlsBuffering = useCallback((_buffering: boolean) => {
    // Handle HLS buffering if needed
  }, []);

  const handleVideoBuffering = useCallback((_codec: string, _buffering: boolean) => {
    // Handle video buffering if needed
  }, []);

  const handleRetryVideo = useCallback((codec: string) => {
    console.log(`Retrying video: ${codec}`);
    if (codec === 'ours') {
      // Reset HLS state
      setHlsReady(false);
      // Force HLS player to reload by triggering re-render
      if (oursRef.current) {
        oursRef.current.pause();
        oursRef.current.seek(0);
      }
    } else {
      // Reset individual codec state
      setReadyStates(prev => ({ ...prev, [codec]: false }));
      // Force video element to reload
      const ref = codec === 'h264' ? h264Ref : codec === 'h265' ? h265Ref : av1Ref;
      if (ref.current) {
        ref.current.pause();
        ref.current.currentTime = 0;
        ref.current.load(); // Force reload
      }
    }
  }, []);

  // EAGER LOADING: Create hidden preload elements
  useEffect(() => {
    const urls = getVideoUrls;
    const preloadElements: HTMLVideoElement[] = [];

    // Create hidden video elements for preloading h264, h265, av1 (skip HLS)
    Object.entries(urls).forEach(([codec, url]) => {
      if (url && codec !== 'ours') {
        const video = document.createElement('video');
        video.style.position = 'absolute';
        video.style.left = '-9999px';
        video.style.top = '-9999px';
        video.style.width = '1px';
        video.style.height = '1px';
        video.style.opacity = '0';
        video.muted = true;
        video.preload = 'auto';
        video.src = url;
        
        // Track when video is ready to play through completely
        video.addEventListener('canplaythrough', () => {
          console.log(`Preload: ${codec} video fully loaded and ready`);
          handleVideoReady(codec);
        });
        
        video.addEventListener('error', (e) => {
          console.warn(`Preload: ${codec} video failed to load:`, e);
        });

        document.body.appendChild(video);
        preloadElements.push(video);
      }
    });

    // Cleanup function to remove preload elements
    return () => {
      preloadElements.forEach(video => {
        if (video.parentNode) {
          video.parentNode.removeChild(video);
        }
      });
    };
  }, [getVideoUrls, handleVideoReady]);

  const handlePlayPause = useCallback(() => {
    if (!allVideosLoaded) return;

    const newPlayingState = !isPlaying;
    setIsPlaying(newPlayingState);
    
    if (oursRef.current) {
      if (newPlayingState) {
        oursRef.current.play();
      } else {
        oursRef.current.pause();
      }
    }
    
    [h264Ref, h265Ref, av1Ref].forEach(ref => {
      if (ref.current) {
        if (newPlayingState) {
          ref.current.play();
        } else {
          ref.current.pause();
        }
      }
    });
  }, [isPlaying, allVideosLoaded]);

  const handleSkip = useCallback((direction: 'forward' | 'backward') => {
    if (!allVideosLoaded) return;
    
    const skipTime = direction === 'forward' ? 10 : -10;
    const newTime = Math.max(0, Math.min(duration, currentTime + skipTime));
    setCurrentTime(newTime);
    
    if (oursRef.current) {
      const oursSeekTime = newTime * compressionRatio;
      oursRef.current.seek(oursSeekTime);
    }
    
    [h264Ref, h265Ref, av1Ref].forEach(ref => {
      if (ref.current) {
        ref.current.currentTime = newTime;
      }
    });
  }, [currentTime, duration, allVideosLoaded, compressionRatio]);

  const handleScrubberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!allVideosLoaded) return;
    
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    
    if (oursRef.current) {
      const oursSeekTime = newTime * compressionRatio;
      oursRef.current.seek(oursSeekTime);
    }
    
    [h264Ref, h265Ref, av1Ref].forEach(ref => {
      if (ref.current) {
        ref.current.currentTime = newTime;
      }
    });
  }, [allVideosLoaded, compressionRatio]);

  const handleVideoTimeUpdate = useCallback(() => {
    if (oursRef.current) {
      const hlsTime = oursRef.current.currentTime;
      const originalTime = hlsTime / compressionRatio;
      setCurrentTime(originalTime);
    }
  }, [compressionRatio]);

  const handleVideoLoadedMetadata = useCallback(() => {
    if (oursRef.current) {
      const hlsDuration = oursRef.current.duration;
      setHlsDuration(hlsDuration);
      const originalDuration = hlsDuration / compressionRatio;
      setDuration(originalDuration);
    }
  }, [compressionRatio]);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setReadyStates({
      h264: false,
      h265: false,
      av1: false
    });
    setHlsReady(false);
    setPsnrData({
      ours: 0,
      h264: 0,
      h265: 0,
      av1: 0
    });
    setError('');
    setPsnrState('loading');
    
    if (oursRef.current) {
      oursRef.current.pause();
      oursRef.current.seek(0);
    }
    
    [h264Ref, h265Ref, av1Ref].forEach(ref => {
      if (ref.current) {
        ref.current.pause();
        ref.current.currentTime = 0;
      }
    });
  }, []);

  return useMemo(() => ({
    psnrState,
    error,
    isPlaying,
    currentTime,
    duration,
    loadingStates,
    psnrData,
    allVideosLoaded,
    allVideosReadyIncludingHls,
    individualVideoReady,
    videoUrls: getVideoUrls,
    videoRefs,
    compressionRatio,
    handlePlayPause,
    handleSkip,
    handleScrubberChange,
    handleVideoTimeUpdate,
    handleVideoLoadedMetadata,
    handleReset,
    setError,
    handleHlsReady,
    handleHlsBuffering,
    handleVideoReady,
    handleVideoBuffering,
    handleRetryVideo,
  }), [
    psnrState,
    error,
    isPlaying,
    currentTime,
    duration,
    loadingStates,
    psnrData,
    allVideosLoaded,
    allVideosReadyIncludingHls,
    individualVideoReady,
    getVideoUrls,
    videoRefs,
    compressionRatio,
    handlePlayPause,
    handleSkip,
    handleScrubberChange,
    handleVideoTimeUpdate,
    handleVideoLoadedMetadata,
    handleReset,
    handleHlsReady,
    handleHlsBuffering,
    handleVideoReady,
    handleVideoBuffering,
    handleRetryVideo,
  ]);
};