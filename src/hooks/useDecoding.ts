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
}

interface UseDecodingReturn {
  decodingState: DecodingState;
  decodingError: string;
  decodingResult: DecodingResult | null;
  decodingProgress: DecodingProgress;
  startDecode: () => Promise<void>;
  resetDecode: () => Promise<void>;
  takeScreenshot: (videoElement?: HTMLVideoElement | null, currentTime?: number) => string;
}

export const useDecoding = (key?: string): UseDecodingReturn => {
  const [decodingState, setDecodingState] = useState<DecodingState>('initial');
  const [decodingError, setDecodingError] = useState('');
  const [decodingResult, setDecodingResult] = useState<DecodingResult | null>(null);
  const [decodingProgress, setDecodingProgress] = useState<DecodingProgress>({
    progress: 0,
    eta: '',
  });

  // Reset state when key changes
  useEffect(() => {
    if (key) {
      setDecodingError('');
      setDecodingState('initial');
      setDecodingResult(null);
      setDecodingProgress({
        progress: 0,
        eta: '',
      });
    }
  }, [key]);

  // Start decoding process
  const startDecode = useCallback(async () => {
    setDecodingError('');
    setDecodingState('decoding');
    setDecodingResult(null);
    setDecodingProgress({
      progress: 0,
      eta: '',
    });
    try {
      if (!key) {
        setDecodingError('No key available for decoding');
        setDecodingState('error');
        return;
      }
      
      const res = await fetch(`http://localhost:9000/start_decode?key=${encodeURIComponent(key)}`, {
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
          const res = await fetch(`http://localhost:9000/poll_decode_started?key=${encodeURIComponent(key)}`);
          const { result: started } = await res.json();
          if (typeof started === 'number' && started > 0) {
            // Decoding started successfully
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
  }, [key]);

  // Polling logic inside useEffect
  useEffect(() => {
    let interval: number;

    const pollDecode = async () => {
      try {
        if (!key) {
          throw new Error('No key available for polling');
        }
        
        const response = await fetch(`http://localhost:9000/poll_decode?key=${encodeURIComponent(key)}`);
        if (!response.ok) {
          throw new Error('Failed to poll decoding status');
        }
        const data = await response.json();
        const { result } = data;
        const { end_time, eta, progress } = result;
        setDecodingProgress(prev => ({
          ...prev,
          progress: typeof progress === 'number' ? progress : 0,
          eta: (typeof eta === 'number')
            ? (eta >= 60
                ? `${Math.floor(eta / 60)}:${String(Math.round(eta % 60)).padStart(2, '0')}`
                : `${Math.round(eta)}s`)
            : '',
        }));
        if (typeof end_time === 'number' && !isNaN(end_time)) {
          // Fetch metadata from the backend
          try {
            const metadataResponse = await fetch(`http://localhost:9000/metadata_decode?key=${encodeURIComponent(key)}`);
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
  }, [decodingState, key]);


  const resetDecode = useCallback(async () => {
    try {
      if (key) {
        await fetch('http://localhost:9000/reset_decode', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key }),
        });
      }
    } catch (e) {
      // Optionally handle/log error, but always reset local state
    }
    setDecodingError('');
    setDecodingState('initial');
    setDecodingResult(null);
    setDecodingProgress({
      progress: 0,
      eta: '',
    });
  }, [key]);

  const takeScreenshot = useCallback((videoElement?: HTMLVideoElement | null, currentTime?: number): string => {
    if (!videoElement) {
      throw new Error('Video element not available');
    }

    if (!key) {
      throw new Error('No key available for screenshot');
    }

    try {
      // Create a canvas element
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      // Set canvas dimensions to match video
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;

      // Draw the current video frame to canvas
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error('Failed to create screenshot');
        }

        // Generate filename with key and current time
        const timestamp = Math.floor(currentTime || 0);
        const filename = `screenshot_${key}_${timestamp.toString().padStart(3, '0')}.png`;

        // Create download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 'image/png');

      // Return filename for reference
      const timestamp = Math.floor(currentTime || 0);
      return `screenshot_${key}_${timestamp.toString().padStart(3, '0')}.png`;
    } catch (err) {
      throw new Error('Failed to take screenshot');
    }
  }, [key]);

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