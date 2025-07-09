import { useState, useEffect, useCallback, useMemo } from 'react';

export type DecodingState = 'initial' | 'decoding' | 'error' | 'done';

export interface DecodingResult {
  duration: number; // seconds
  frameCount: number;
  psnr: number; // dB (actual)
  expectedPsnr?: number; // dB (expected)
  ssim?: number; // Structural Similarity Index
  quality?: 'high' | 'medium' | 'low' | string;
  decodedVideoUrl?: string;
  // New fields from backend
  endTime?: number;
  decodingTimeS?: number;
  videoPath?: string;
  videoSizeMB?: number;
  processedSequences?: number;
  psnrStd?: number;
  h264CompressionRatio?: number;
  bitrateMbps?: number;
  qualityRating?: string;
  businessImpact?: string;
  memoryPeakMB?: number;
  memoryIncreaseMB?: number;
  lightningEnabled?: boolean;
}

export interface DecodingProgress {
  progress: number; // 0-100
  eta: string; // estimated time remaining
  currentFrame: number;
  totalFrames: number;
}

interface UseDecodingReturn {
  decodingState: DecodingState;
  decodingError: string;
  decodingResult: DecodingResult | null;
  decodingProgress: DecodingProgress;
  startDecode: () => Promise<void>;
  resetDecode: () => Promise<void>;
  takeScreenshot: () => Promise<string>;
}

export const useDecoding = (): UseDecodingReturn => {
  const [decodingState, setDecodingState] = useState<DecodingState>('initial');
  const [decodingError, setDecodingError] = useState('');
  const [decodingResult, setDecodingResult] = useState<DecodingResult | null>(null);
  const [decodingProgress, setDecodingProgress] = useState<DecodingProgress>({
    progress: 0,
    eta: '18s',
    currentFrame: 0,
    totalFrames: 1800,
  });

  // Start decoding process
  const startDecode = useCallback(async () => {
    setDecodingError('');
    setDecodingState('decoding');
    setDecodingResult(null);
    setDecodingProgress({
      progress: 0,
      eta: '18s',
      currentFrame: 0,
      totalFrames: 1800,
    });
    try {
      const res = await fetch('http://localhost:9000/start_decode', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const { result } = await res.json();
      if (!["ok", "already_running"].includes(result)) {
        setDecodingError('Decoding already running or failed to start.');
        setDecodingState('error');
        return;
      }
      // Wait for backend to confirm start
      const checkStart = async () => {
        try {
          const res = await fetch('http://localhost:9000/poll_decode_started');
          const { result: started } = await res.json();
          if (typeof started === 'number' && started > 0) {
            setDecodingProgress(prev => ({ ...prev, currentFrame: 0 }));
          } else {
            setTimeout(checkStart, 1500);
          }
        } catch (err) {
          setTimeout(checkStart, 1500);
        }
      };
      checkStart();
    } catch (err) {
      setDecodingError('Start decode request failed');
      setDecodingState('error');
    }
  }, []);

  // Polling logic inside useEffect
  useEffect(() => {
    let interval: number;

    const pollDecode = async () => {
      try {
        const response = await fetch('http://localhost:9000/poll_decode');
        if (!response.ok) {
          throw new Error('Failed to poll decoding status');
        }
        const data = await response.json();
        const { result } = data;
        const { end_time, eta, progress, current_frame, total_frames } = result;
        setDecodingProgress(prev => ({
          ...prev,
          progress: typeof progress === 'number' ? progress : 0,
          eta: (typeof eta === 'number')
            ? (eta >= 60
                ? `${Math.floor(eta / 60)}:${String(Math.round(eta % 60)).padStart(2, '0')}`
                : `${Math.round(eta)}s`)
            : '',
          currentFrame: typeof current_frame === 'number' ? current_frame : prev.currentFrame,
          totalFrames: typeof total_frames === 'number' ? total_frames : prev.totalFrames,
        }));
        if (typeof end_time === 'number' && !isNaN(end_time)) {
          // Fetch metadata from the backend
          try {
            const metadataResponse = await fetch('http://localhost:9000/metadata_decode');
            if (metadataResponse.ok) {
              const response = await metadataResponse.json();
              const meta = response.result;
              setDecodingResult({
                duration: meta.decoding_time_s || 0,
                frameCount: meta.video_frames || 0,
                psnr: meta.avg_psnr || 0,
                expectedPsnr: meta.expected_psnr || 0,
                ssim: meta.ssim || 0,
                quality: meta.quality || meta.quality_rating || 'medium',
                decodedVideoUrl: meta.video_path || '',
                endTime: meta.end_time,
                decodingTimeS: meta.decoding_time_s,
                videoPath: meta.video_path,
                videoSizeMB: meta.video_size_mb,
                processedSequences: meta.processed_sequences,
                psnrStd: meta.psnr_std,
                h264CompressionRatio: meta.h264_compression_ratio,
                bitrateMbps: (meta.bitrate_mbps && (meta.bitrate_mbps.parsedValue || parseFloat(meta.bitrate_mbps.source))) || 0,
                qualityRating: meta.quality_rating,
                businessImpact: meta.business_impact,
                memoryPeakMB: (meta.memory_peak_mb && (meta.memory_peak_mb.parsedValue || parseFloat(meta.memory_peak_mb.source))) || 0,
                memoryIncreaseMB: meta.memory_increase_mb,
                lightningEnabled: meta.lightning_enabled,
              });
            }
          } catch (error) {
            setDecodingError('Failed to fetch decode metadata');
          }
          setDecodingState('done');
          setDecodingProgress(prev => ({ ...prev, progress: 100 }));
          clearInterval(interval);
        }
      } catch (e: any) {
        clearInterval(interval);
        setDecodingError(e.message || 'Polling failed');
        setDecodingState('error');
      }
    };

    if (decodingState === 'decoding') {
      interval = setInterval(pollDecode, 1500);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [decodingState]);


  const resetDecode = useCallback(async () => {
    setDecodingError('');
    setDecodingState('initial');
    setDecodingResult(null);
    setDecodingProgress({
      progress: 0,
      eta: '18s',
      currentFrame: 0,
      totalFrames: 1800,
    });
  }, []);

  const takeScreenshot = useCallback(async (): Promise<string> => {
    await new Promise(res => setTimeout(res, 200));
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `screenshot-${timestamp}.png`;
  }, []);

  return useMemo(() => ({
    decodingState,
    decodingError,
    decodingResult,
    decodingProgress,
    startDecode,
    resetDecode,
    takeScreenshot,
  }), [decodingState, decodingError, decodingResult, decodingProgress, startDecode, resetDecode, takeScreenshot]);
}; 