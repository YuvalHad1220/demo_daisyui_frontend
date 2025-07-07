import { useState, useCallback, useMemo } from 'react';

export type ScreenshotSearchState = 'initial' | 'searching' | 'error' | 'done';

export interface ScreenshotMatch {
  id: string;
  url: string;
  filename: string;
  timestamp: string; // HH:MM:SS format
  confidence: number; // 0-100
  similarity: number; // 0-1
  frameNumber: number;
  videoTime: number; // seconds
}

export interface ScreenshotSearchResult {
  matches: ScreenshotMatch[];
  totalMatches: number;
  searchDuration: number; // seconds
  searchMethod: 'template_matching' | 'feature_matching' | 'deep_learning';
  processingTime: number; // seconds
}

export interface ScreenshotSearchProgress {
  progress: number; // 0-100
  eta: string; // estimated time remaining
  currentFrame: number;
  totalFrames: number;
  matchesFound: number;
  processingMethod: string;
}

interface UseScreenshotSearchReturn {
  searchState: ScreenshotSearchState;
  searchError: string;
  searchResult: ScreenshotSearchResult | null;
  searchProgress: ScreenshotSearchProgress;
  startSearch: (screenshots: File[]) => Promise<void>;
  pollSearch: () => Promise<void>;
  resetSearch: () => Promise<void>;
  takeScreenshot: () => Promise<string>;
  jumpToTimestamp: (timestamp: string) => Promise<void>;
}

export const useScreenshotSearch = (): UseScreenshotSearchReturn => {
  const [searchState, setSearchState] = useState<ScreenshotSearchState>('initial');
  const [searchError, setSearchError] = useState('');
  const [searchResult, setSearchResult] = useState<ScreenshotSearchResult | null>(null);
  const [searchProgress, setSearchProgress] = useState<ScreenshotSearchProgress>({
    progress: 0,
    eta: '25s',
    currentFrame: 0,
    totalFrames: 2400,
    matchesFound: 0,
    processingMethod: 'Initializing...',
  });

  // Simulate backend API
  const fakeApi = async (data: any, ms = 600) => {
    await new Promise(res => setTimeout(res, ms));
    return data;
  };

  const startSearch = useCallback(async (screenshots: File[]) => {
    setSearchError('');
    setSearchState('searching');
    setSearchResult(null);
    setSearchProgress({
      progress: 0,
      eta: '25s',
      currentFrame: 0,
      totalFrames: 2400,
      matchesFound: 0,
      processingMethod: 'Initializing...',
    });

    try {
      // Simulate search process with progress updates
      const totalDuration = 4000 + Math.random() * 3000; // 4-7 seconds
      const updateInterval = 250; // Update every 250ms
      const totalUpdates = Math.floor(totalDuration / updateInterval);
      
      const processingMethods = [
        'Template matching...',
        'Feature extraction...',
        'Deep learning analysis...',
        'Similarity scoring...',
        'Finalizing results...'
      ];
      
      for (let i = 0; i < totalUpdates; i++) {
        await fakeApi(null, updateInterval);
        
        const progress = Math.min((i / totalUpdates) * 100, 100);
        const currentFrame = Math.floor((progress / 100) * 2400);
        const eta = Math.max(0, Math.round((100 - progress) * 0.6));
        const methodIndex = Math.floor((progress / 100) * processingMethods.length);
        const matchesFound = Math.floor((progress / 100) * (3 + Math.random() * 2)); // 3-5 matches
        
        setSearchProgress({
          progress,
          eta: `${eta}s`,
          currentFrame,
          totalFrames: 2400,
          matchesFound,
          processingMethod: processingMethods[Math.min(methodIndex, processingMethods.length - 1)],
        });

        // Simulate random error (3% chance)
        if (Math.random() < 0.03) {
          throw new Error('Screenshot search failed due to processing error. Please try again.');
        }
      }

      // Mock result data
      const mockMatches: ScreenshotMatch[] = [
        {
          id: 'match_001',
          url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
          filename: 'screenshot_001.png',
          timestamp: '00:12:45',
          confidence: 95,
          similarity: 0.92,
          frameNumber: 765,
          videoTime: 765,
        },
        {
          id: 'match_002',
          url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
          filename: 'screenshot_002.png',
          timestamp: '00:23:10',
          confidence: 87,
          similarity: 0.85,
          frameNumber: 1390,
          videoTime: 1390,
        },
        {
          id: 'match_003',
          url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=300&fit=crop',
          filename: 'screenshot_003.png',
          timestamp: '00:34:05',
          confidence: 78,
          similarity: 0.78,
          frameNumber: 2045,
          videoTime: 2045,
        },
      ];

      const searchMethods: Array<ScreenshotSearchResult['searchMethod']> = [
        'template_matching',
        'feature_matching', 
        'deep_learning'
      ];
      
      setSearchResult({
        matches: mockMatches,
        totalMatches: mockMatches.length,
        searchDuration: 60,
        searchMethod: searchMethods[Math.floor(Math.random() * searchMethods.length)],
        processingTime: Math.round((totalDuration / 1000) * 10) / 10,
      });
      
      setSearchState('done');
    } catch (e: any) {
      setSearchError(e.message || 'Screenshot search failed');
      setSearchState('error');
    }
  }, []);

  const pollSearch = useCallback(async () => {
    // Simulate polling during search process
    if (searchState === 'searching') {
      await fakeApi(null, 500);
    }
  }, [searchState]);

  const resetSearch = useCallback(async () => {
    setSearchError('');
    setSearchState('initial');
    setSearchResult(null);
    setSearchProgress({
      progress: 0,
      eta: '25s',
      currentFrame: 0,
      totalFrames: 2400,
      matchesFound: 0,
      processingMethod: 'Initializing...',
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

  const jumpToTimestamp = useCallback(async (timestamp: string): Promise<void> => {
    // Simulate jumping to a specific timestamp in the video
    await fakeApi(null, 150);
    
    // In a real implementation, this would control the video player
    console.log(`Jumping to timestamp: ${timestamp}`);
  }, []);

  return useMemo(() => ({
    searchState,
    searchError,
    searchResult,
    searchProgress,
    startSearch,
    pollSearch,
    resetSearch,
    takeScreenshot,
    jumpToTimestamp,
  }), [
    searchState,
    searchError,
    searchResult,
    searchProgress,
    startSearch,
    pollSearch,
    resetSearch,
    takeScreenshot,
    jumpToTimestamp,
  ]);
}; 