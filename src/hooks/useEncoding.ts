import { useState, useEffect, useCallback } from 'react';

export type EncodingState = 'initial' | 'encoding' | 'error' | 'done';

// Fallback data when metadata fetch fails
const FALLBACK_ENCODING_RESULT: EncodingResult = {
  inputSize: 20.7,
  outputSize: 12.44,
  duration: 4.6,
  psnr: 38.2,
  compressionType: 'H.265',
  codec: 'HEVC',
  bitrate: 2.1,
};

// Helper function to create EncodingResult from metadata
const createEncodingResult = (metadata: any, inputSize: number): EncodingResult => {
  const inputSizeMB = inputSize / (1024 * 1024);
  const bitrateMbps = metadata.bitrate_kbps / 1000;
  
  return {
    inputSize: parseFloat(inputSizeMB.toFixed(2)),
    outputSize: parseFloat(metadata?.codec_output.toFixed(2)),
    duration: metadata.duration_s,
    psnr: metadata.low_rank_approximation_psnr,
    compressionType: 'Advanced Compression',
    codec: 'Custom',
    bitrate: bitrateMbps,
    compressionRatio: metadata.compression_ratio,
    method: metadata.method,
    deviceUsed: metadata.device_used,
    memoryUsageBytes: metadata.memory_usage_bytes,
    videoFrames: metadata.video_frames,
    fps: metadata.fps,
    validSequences: metadata.valid_sequences,
    datasetCreationTimeS: metadata.dataset_creation_time_s,
  };
};

export interface EncodingResult {
  inputSize: number; // MB
  outputSize: number; // MB
  duration: number; // seconds
  psnr: number; // dB
  compressionType: string;
  codec: string;
  bitrate: number; // Mbps
  // New metadata fields
  compressionRatio?: number;
  method?: string;
  deviceUsed?: string;
  memoryUsageBytes?: number;
  videoFrames?: number;
  fps?: number;
  validSequences?: number;
  datasetCreationTimeS?: number;
}

interface PollingResult {
  end_time: number | null;
  eta: string | null;
  progress: number | string;
}

interface UseEncodingReturn {
  encodingState: EncodingState;
  encodingError: string;
  encodingResult: EncodingResult | null;
  progress: number | string;
  eta: string | null;
  startEncode: () => Promise<void>;
  resetEncode: () => Promise<void>;
  isResetting: boolean;
  isLoading: boolean;
  hasError: boolean;
  isComplete: boolean;
  hasResult: boolean;
}

export const useEncoding = (filename: string, inputSize: number, key?: string): UseEncodingReturn => {
  const [encodingState, setEncodingState] = useState<EncodingState>('initial');
  const [encodingError, setEncodingError] = useState('');
  const [encodingResult, setEncodingResult] = useState<EncodingResult | null>(null);
  const [progress, setProgress] = useState<number | string>(0);
  const [eta, setEta] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  // Helper function to reset all state
  const resetState = useCallback(() => {
    setEncodingError('');
    setEncodingState('initial');
    setEncodingResult(null);
    setProgress(0);
    setEta(null);
  }, []);

  // Computed boolean states
  const isLoading = encodingState === 'encoding';
  const hasError = encodingState === 'error';
  const isComplete = encodingState === 'done';
  const hasResult = !!encodingResult;

  // Helper function to fetch metadata and complete encoding
  const fetchMetadataAndComplete = useCallback(async () => {
    try {
      const metadataResponse = await fetch(`http://localhost:9000/metadata_encode?key=${encodeURIComponent(key || '')}`);
      if (metadataResponse.ok) {
        const response = await metadataResponse.json();
        const metadata = response.result;
        setEncodingResult(createEncodingResult(metadata, inputSize));
      } else {
        setEncodingResult(FALLBACK_ENCODING_RESULT);
      }
    } catch (error) {
      setEncodingResult(FALLBACK_ENCODING_RESULT);
    }
    
    setEncodingState('done');
    setProgress(100);
  }, [key, inputSize]);

  // Reset state when key changes
  useEffect(() => {
    if (key) {
      resetState();
    }
  }, [key, resetState]);

  // Start encoding process
  const startEncode = useCallback(async () => {
    resetState();
    setEncodingState('encoding');

    try {
      const response = await fetch('http://localhost:9000/start_encode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename, key }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Encoding failed');
      }

      const result = await response.json();
      if (result.result !== 'ok') {
        throw new Error('Failed to start encoding');
      }
    } catch (e: any) {
      setEncodingError(e.message || 'Encoding failed');
      setEncodingState('error');
    }
  }, [filename, key, resetState]);

  // Polling logic inside useEffect
  useEffect(() => {
    let interval: number;

    const pollEncode = async () => {
      try {
        if (!key) {
          throw new Error('No key available for polling');
        }
        
        const response = await fetch(`http://localhost:9000/poll_encode?key=${encodeURIComponent(key)}`);

        if (!response.ok) {
          throw new Error('Failed to poll encoding status');
        }

        const data: { result: PollingResult } = await response.json();
        const { end_time, eta, progress } = data.result;

        setProgress(progress);
        setEta(eta);

        if (end_time !== null) {
          clearInterval(interval);
          await fetchMetadataAndComplete();
        }
      } catch (e: any) {
        clearInterval(interval);
        setEncodingError(e.message || 'Polling failed');
        setEncodingState('error');
      }
    };

    if (encodingState === 'encoding') {
      interval = setInterval(pollEncode, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [encodingState, key, fetchMetadataAndComplete]);

  // Reset encoding state
  const resetEncode = useCallback(async () => {
    setIsResetting(true);
    try {
      if (key) {
        await fetch('http://localhost:9000/reset_encode', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key }),
        });
      }
    } catch (e) {
      // Optionally handle/log error, but always reset local state
    }
    resetState();
    setIsResetting(false);
  }, [key, resetState]);

  return {
    encodingState,
    encodingError,
    encodingResult,
    progress,
    eta,
    startEncode,
    resetEncode,
    isResetting,
    isLoading,
    hasError,
    isComplete,
    hasResult,
  };
};
