import { useState, useCallback, useMemo } from 'react';

export type DecodingState = 'initial' | 'decoding' | 'error' | 'done';

export interface DecodingResult {
  duration: number; // seconds
  frameCount: number;
  psnr: number; // dB (actual)
  expectedPsnr: number; // dB (expected)
  ssim: number; // Structural Similarity Index
  quality: 'high' | 'medium' | 'low';
  decodedVideoUrl?: string;
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
  pollDecode: () => Promise<void>;
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

  // Simulate backend API
  const fakeApi = async (data: any, ms = 600) => {
    await new Promise(res => setTimeout(res, ms));
    return data;
  };

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
      // Simulate decoding process with progress updates
      const totalDuration = 3000 + Math.random() * 2000; // 3-5 seconds
      const updateInterval = 200; // Update every 200ms
      const totalUpdates = Math.floor(totalDuration / updateInterval);
      
      for (let i = 0; i < totalUpdates; i++) {
        await fakeApi(null, updateInterval);
        
        const progress = Math.min((i / totalUpdates) * 100, 100);
        const currentFrame = Math.floor((progress / 100) * 1800);
        const eta = Math.max(0, Math.round((100 - progress) * 0.8));
        
        setDecodingProgress({
          progress,
          eta: `${eta}s`,
          currentFrame,
          totalFrames: 1800,
        });

        // Simulate random error (5% chance)
        if (Math.random() < 0.05) {
          throw new Error('Decoding failed due to a processing error. Please try again.');
        }
      }

      // Mock result data
      const actualPsnr = 38.2 + (Math.random() - 0.5) * 4; // 36.2 - 40.2 dB
      const quality = actualPsnr > 37 ? 'high' : actualPsnr > 32 ? 'medium' : 'low';
      
      setDecodingResult({
        duration: 60,
        frameCount: 1800,
        psnr: Math.round(actualPsnr * 10) / 10, // Round to 1 decimal
        expectedPsnr: 40.0,
        ssim: 0.98,
        quality,
        decodedVideoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', // Sample video URL
      });
      
      setDecodingState('done');
    } catch (e: any) {
      setDecodingError(e.message || 'Decoding failed');
      setDecodingState('error');
    }
  }, []);

  const pollDecode = useCallback(async () => {
    // Simulate polling during decoding process
    if (decodingState === 'decoding') {
      await fakeApi(null, 500);
    }
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
    await fakeApi(null, 300);
  }, []);

  const takeScreenshot = useCallback(async (): Promise<string> => {
    // Simulate taking a screenshot
    await fakeApi(null, 200);
    
    // Return a mock screenshot URL or data
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `screenshot-${timestamp}.png`;
  }, []);

  return useMemo(() => ({
    decodingState,
    decodingError,
    decodingResult,
    decodingProgress,
    startDecode,
    pollDecode,
    resetDecode,
    takeScreenshot,
  }), [
    decodingState,
    decodingError,
    decodingResult,
    decodingProgress,
    startDecode,
    pollDecode,
    resetDecode,
    takeScreenshot,
  ]);
}; 