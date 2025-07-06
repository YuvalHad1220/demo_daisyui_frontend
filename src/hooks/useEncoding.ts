import { useState, useCallback, useMemo } from 'react';

export type EncodingState = 'initial' | 'encoding' | 'error' | 'done';

export interface EncodingResult {
  inputSize: number; // MB
  outputSize: number; // MB
  duration: number; // seconds
  psnr: number; // dB
  compressionType: string;
  codec: string;
  bitrate: number; // Mbps
}

interface UseEncodingReturn {
  encodingState: EncodingState;
  encodingError: string;
  encodingResult: EncodingResult | null;
  startEncode: () => Promise<void>;
  pollEncode: () => Promise<void>;
  resetEncode: () => Promise<void>;
}

export const useEncoding = (): UseEncodingReturn => {
  const [encodingState, setEncodingState] = useState<EncodingState>('initial');
  const [encodingError, setEncodingError] = useState('');
  const [encodingResult, setEncodingResult] = useState<EncodingResult | null>(null);

  // Simulate backend API
  const fakeApi = async (data: any, ms = 600) => {
    await new Promise(res => setTimeout(res, ms));
    return data;
  };

  const startEncode = useCallback(async () => {
    setEncodingError('');
    setEncodingState('encoding');
    setEncodingResult(null);
    try {
      await fakeApi(null, 2500 + Math.random() * 2000);
      if (Math.random() < 0.15) {
        throw new Error('Encoding failed due to a network error. Please try again.');
      }
      // Mock result data
      setEncodingResult({
        inputSize: 20.7,
        outputSize: 12.44,
        duration: 4.6,
        psnr: 38.2,
        compressionType: 'H.265',
        codec: 'HEVC',
        bitrate: 2.1,
      });
      setEncodingState('done');
    } catch (e: any) {
      setEncodingError(e.message || 'Encoding failed');
      setEncodingState('error');
    }
  }, []);

  const pollEncode = useCallback(async () => {
    // Simulate polling (no progress, just a delay)
    if (encodingState === 'encoding') {
      await fakeApi(null, 500);
    }
  }, [encodingState]);

  const resetEncode = useCallback(async () => {
    setEncodingError('');
    setEncodingState('initial');
    setEncodingResult(null);
    await fakeApi(null, 300);
  }, []);

  return useMemo(() => ({
    encodingState,
    encodingError,
    encodingResult,
    startEncode,
    pollEncode,
    resetEncode,
  }), [encodingState, encodingError, encodingResult, startEncode, pollEncode, resetEncode]);
}; 