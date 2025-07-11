import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useCodecDataFetch } from './useCodecDataFetch';
import type { HlsPlayerRef } from '../components/ui/HlsPlayer';

export type PsnrComparisonState = 'loading' | 'ready' | 'error';

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
  videoUrls: Record<string, string>;
  videoRefs: {
    ours: React.RefObject<HlsPlayerRef | null>;
    h264: React.RefObject<HTMLVideoElement | null>;
    h265: React.RefObject<HTMLVideoElement | null>;
    av1: React.RefObject<HTMLVideoElement | null>;
  };
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
}

export const usePsnrComparison = (key: string): UsePsnrComparisonReturn => {
  
  const { videoDataMap, loading, fetchData } = useCodecDataFetch(key || '');

  useEffect(() => {
    if (key) {
      fetchData('medium');
    }
  }, [key, fetchData]);

  // Create video refs - FIXED: Create refs outside useMemo
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

  // Construct video URLs
  const getVideoUrls = useMemo(() => {
    const urls: Record<string, string> = {
      ours: '', // Will be set below
      h264: videoDataMap.h264?.video_url || '',
      h265: videoDataMap.h265?.video_url || '',
      av1: videoDataMap.av1?.video_url || ''
    };

    // For "ours", construct the decoded video URL like in Step5DecodedVideo
    if (key) {
      // Extract filename from key (assuming key contains the filename)
      const filename = key.replace(/\.mp4$/, '');
      const keyParam = `?key=${encodeURIComponent(key)}`;
      urls.ours = `http://localhost:9000/hls/${filename}/decoded/stream.m3u8${keyParam}`;
    }

    console.log('Video URLs:', urls);
    console.log('Video Data Map:', videoDataMap);
    console.log('Key:', key);

    return urls;
  }, [videoDataMap, key]);

  const [psnrState, setPsnrState] = useState<PsnrComparisonState>('loading');
  const [error, setError] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(60);
  
  // FIXED: Track loading/ready states for all videos including HLS
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({
    ours: true,
    h264: true,
    h265: true,
    av1: true
  });
  
  // FIXED: Track ready states separately from loading states
  const [readyStates, setReadyStates] = useState<Record<string, boolean>>({
    ours: false,
    h264: false,
    h265: false,
    av1: false
  });

  // FIXED: Track buffering states for synchronized playback
  const [bufferingStates, setBufferingStates] = useState<Record<string, boolean>>({
    ours: false,
    h264: false,
    h265: false,
    av1: false
  });

  const [psnrData, setPsnrData] = useState<Record<string, number>>({
    ours: 0,
    h264: 0,
    h265: 0,
    av1: 0
  });

  // Update loading states based on videoDataMap availability
  useEffect(() => {
    console.log('Video data map changed:', videoDataMap);
    setLoadingStates(prev => ({
      ours: prev.ours, // Keep HLS loading state as is
      h264: !videoDataMap.h264,
      h265: !videoDataMap.h265,
      av1: !videoDataMap.av1
    }));
  }, [videoDataMap]);

  // FIXED: All videos must be ready AND not buffering to be considered loaded (ignoring 'ours' buffering)
  const allVideosLoaded = useMemo(() => {
    const standardCodecs = ['h264', 'h265', 'av1'];
    const loaded =
      Object.values(readyStates).every(ready => ready) &&
      !standardCodecs.some(codec => bufferingStates[codec]);
    console.log('All videos loaded calculation:', {
      readyStates,
      bufferingStates,
      allVideosLoaded: loaded
    });
    return loaded;
  }, [readyStates, bufferingStates]);

  // FIXED: Monitor buffering states and pause all videos if any is buffering (ignoring 'ours' buffering)
  useEffect(() => {
    const standardCodecs = ['h264', 'h265', 'av1'];
    const anyStandardBuffering = standardCodecs.some(codec => bufferingStates[codec]);

    if (anyStandardBuffering && isPlaying) {
      // Pause all videos when any standard video is buffering
      if (oursRef.current) {
        oursRef.current.pause();
      }
      
      [h264Ref, h265Ref, av1Ref].forEach(ref => {
        if (ref.current) {
          ref.current.pause();
        }
      });
    } else if (!anyStandardBuffering && isPlaying && allVideosLoaded) {
      // Resume all videos when buffering stops
      if (oursRef.current) {
        oursRef.current.play();
      }
      
      [h264Ref, h265Ref, av1Ref].forEach(ref => {
        if (ref.current) {
          ref.current.play();
        }
      });
    }
  }, [bufferingStates, isPlaying, allVideosLoaded, oursRef, h264Ref, h265Ref, av1Ref]);

  // Update PSNR data when videoDataMap changes
  useEffect(() => {
    const newPsnrData = {
      ours: 42.3, // Keep simulated data for ours
      h264: videoDataMap.h264?.psnr || 0,
      h265: videoDataMap.h265?.psnr || 0,
      av1: videoDataMap.av1?.psnr || 0
    };
    setPsnrData(newPsnrData);
  }, [videoDataMap]);

  useEffect(() => {
    if (allVideosLoaded) {
        setPsnrState('ready');
    }
  }, [allVideosLoaded]);

  useEffect(() => {
    // Update PSNR values in real-time
    const interval = setInterval(() => {
      if (isPlaying && allVideosLoaded) {
        setPsnrData(prev => ({
          ours: prev.ours + (Math.random() - 0.5) * 0.5,
          h264: prev.h264 + (Math.random() - 0.5) * 0.5,
          h265: prev.h265 + (Math.random() - 0.5) * 0.5,
          av1: prev.av1 + (Math.random() - 0.5) * 0.5
        }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, allVideosLoaded]);

  // FIXED: Enhanced event handlers for synchronization
  const handleHlsReady = useCallback(() => {
    console.log('HLS player ready event fired');
    setReadyStates(prev => ({ ...prev, ours: true }));
    setLoadingStates(prev => ({ ...prev, ours: false }));
  }, []);

  const handleHlsBuffering = useCallback((buffering: boolean) => {
    console.log('HLS player buffering event fired:', buffering);
    setBufferingStates(prev => ({ ...prev, ours: buffering }));
  }, []);

  const handleVideoReady = useCallback((codec: string) => {
    console.log('Video ready event fired for:', codec);
    setReadyStates(prev => ({ ...prev, [codec]: true }));
    setLoadingStates(prev => ({ ...prev, [codec]: false }));
  }, []);

  const handleVideoBuffering = useCallback((codec: string, buffering: boolean) => {
    console.log('Video buffering event fired for:', codec, buffering);
    setBufferingStates(prev => ({ ...prev, [codec]: buffering }));
  }, []);

  // FIXED: Update loading states when ready states change
  useEffect(() => {
    console.log('Ready states changed:', readyStates);
    setLoadingStates(prev => ({
      ours: !readyStates.ours,
      h264: !readyStates.h264,
      h265: !readyStates.h265,
      av1: !readyStates.av1
    }));
  }, [readyStates]);

  // FIXED: Fallback timeout for HLS player ready state
  useEffect(() => {
    if (!readyStates.ours && videoUrls.ours) {
      console.log('Setting up HLS fallback timeout');
      const timer = setTimeout(() => {
        console.log('HLS player ready fallback triggered');
        handleHlsReady();
      }, 3000); // 3 second fallback
      
      return () => {
        console.log('Clearing HLS fallback timeout');
        clearTimeout(timer);
      };
    }
  }, [readyStates.ours, videoUrls.ours, handleHlsReady]);

  // FIXED: Fallback timeouts for regular video elements
  useEffect(() => {
    const timers: number[] = [];
    
    if (!readyStates.h264 && videoUrls.h264) {
      console.log('Setting up H264 fallback timeout');
      timers.push(setTimeout(() => {
        console.log('H264 ready fallback triggered');
        handleVideoReady('h264');
      }, 2000));
    }
    
    if (!readyStates.h265 && videoUrls.h265) {
      console.log('Setting up H265 fallback timeout');
      timers.push(setTimeout(() => {
        console.log('H265 ready fallback triggered');
        handleVideoReady('h265');
      }, 2000));
    }
    
    if (!readyStates.av1 && videoUrls.av1) {
      console.log('Setting up AV1 fallback timeout');
      timers.push(setTimeout(() => {
        console.log('AV1 ready fallback triggered');
        handleVideoReady('av1');
      }, 2000));
    }
    
    return () => {
      console.log('Clearing video fallback timeouts');
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [readyStates.h264, readyStates.h265, readyStates.av1, videoUrls.h264, videoUrls.h265, videoUrls.av1, handleVideoReady]);

  const handlePlayPause = useCallback(() => {
    // FIXED: Don't allow playing if videos are not ready or any is buffering
    if (!allVideosLoaded) {
      return;
    }

    const newPlayingState = !isPlaying;
    setIsPlaying(newPlayingState);
    
    // Control all videos
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
  }, [isPlaying, allVideosLoaded, oursRef, h264Ref, h265Ref, av1Ref]);

  const handleSkip = useCallback((direction: 'forward' | 'backward') => {
    if (!allVideosLoaded) return;
    
    const skipTime = direction === 'forward' ? 10 : -10;
    const newTime = Math.max(0, Math.min(duration, currentTime + skipTime));
    setCurrentTime(newTime);
    
    // Seek all videos
    if (oursRef.current) {
      oursRef.current.seek(newTime);
    }
    
    [h264Ref, h265Ref, av1Ref].forEach(ref => {
      if (ref.current) {
        ref.current.currentTime = newTime;
      }
    });
  }, [currentTime, duration, allVideosLoaded, oursRef, h264Ref, h265Ref, av1Ref]);

  const handleScrubberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!allVideosLoaded) return;
    
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    
    // Seek all videos
    if (oursRef.current) {
      oursRef.current.seek(newTime);
    }
    
    [h264Ref, h265Ref, av1Ref].forEach(ref => {
      if (ref.current) {
        ref.current.currentTime = newTime;
      }
    });
  }, [allVideosLoaded, oursRef, h264Ref, h265Ref, av1Ref]);

  const handleVideoTimeUpdate = useCallback(() => {
    // Use the HLS player's time as the source of truth
    if (oursRef.current) {
      setCurrentTime(oursRef.current.currentTime);
    }
  }, [oursRef]);

  const handleVideoLoadedMetadata = useCallback(() => {
    // Use the HLS player's duration as the source of truth
    if (oursRef.current) {
      setDuration(oursRef.current.duration);
    }
  }, [oursRef]);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setLoadingStates({
      ours: true,
      h264: true,
      h265: true,
      av1: true
    });
    setReadyStates({
      ours: false,
      h264: false,
      h265: false,
      av1: false
    });
    setBufferingStates({
      ours: false,
      h264: false,
      h265: false,
      av1: false
    });
    setPsnrData({
      ours: 0,
      h264: 0,
      h265: 0,
      av1: 0
    });
    setError('');
    setPsnrState('loading');
    
    // Reset all videos
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
  }, [oursRef, h264Ref, h265Ref, av1Ref]);

  return useMemo(() => ({
    psnrState,
    error,
    isPlaying,
    currentTime,
    duration,
    loadingStates,
    psnrData,
    allVideosLoaded,
    videoUrls: getVideoUrls,
    videoRefs,
    handlePlayPause,
    handleSkip,
    handleScrubberChange,
    handleVideoTimeUpdate,
    handleVideoLoadedMetadata,
    handleReset,
    setError,
    // FIXED: Expose new handlers for synchronization
    handleHlsReady,
    handleHlsBuffering,
    handleVideoReady,
    handleVideoBuffering,
  }), [
    psnrState,
    error,
    isPlaying,
    currentTime,
    duration,
    loadingStates,
    psnrData,
    allVideosLoaded,
    getVideoUrls,
    videoRefs,
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
  ]);
};