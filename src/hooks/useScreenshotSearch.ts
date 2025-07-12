import { useState, useEffect, useCallback } from 'react';

export type ScreenshotSearchState = 'initial' | 'searching' | 'error' | 'done';

// Default progress state
const DEFAULT_PROGRESS: ScreenshotSearchProgress = {
  progress: 0,
  eta: '25s',
  currentFrame: 0,
  totalFrames: 2400,
  matchesFound: 0,
  processingMethod: 'Initializing...',
};

// Helper function to format timestamp
const formatTimestamp = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Helper function to create default search result
const createEmptySearchResult = (): ScreenshotSearchResult => ({
  matches: [],
  totalMatches: 0,
  searchDuration: 0,
  searchMethod: 'deep_learning',
  processingTime: 0,
  data: [],
  metadata: null,
});

// Helper function to transform search data to matches
const transformSearchData = (searchData: any[]): ScreenshotMatch[] => {
  const matches: ScreenshotMatch[] = [];
  if (Array.isArray(searchData)) {
    searchData.forEach((item, index) => {
      if (item.top_results && Array.isArray(item.top_results)) {
        item.top_results.forEach((result: any) => {
          matches.push({
            id: `${index}-${result.timestamp || Date.now()}`,
            url: result.url || '',
            filename: result.filename || `match-${index}`,
            timestamp: formatTimestamp(result.timestamp || 0),
            confidence: result.confidence || 0,
            similarity: result.similarity || 0,
            frameNumber: result.frame_number || 0,
            videoTime: result.timestamp || 0,
          });
        });
      }
    });
  }
  return matches;
};

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
  data?: any[]; // Backend results
  metadata?: any; // Backend metadata
}

export interface ScreenshotSearchProgress {
  progress: number; // 0-100
  eta: string; // estimated time remaining
  currentFrame: number;
  totalFrames: number;
  matchesFound: number;
  processingMethod: string;
  finished?: boolean;
  in_progress?: boolean;
}

interface UseScreenshotSearchReturn {
  searchState: ScreenshotSearchState;
  searchError: string;
  searchResult: ScreenshotSearchResult | null;
  searchProgress: ScreenshotSearchProgress;
  uploadedImageUrls: { [filename: string]: string };
  startSearch: (videoPath: string, imagesPaths: string[]) => Promise<void>;
  resetSearch: () => Promise<void>;
  takeScreenshot: () => Promise<string>;
  jumpToTimestamp: (timestamp: string) => Promise<void>;
  addUploadedImage: (filename: string, fileUrl: string) => void;
  selectedFiles: File[];
  setSelectedFiles: React.Dispatch<React.SetStateAction<File[]>>;
  isResetting: boolean;
  isLoading: boolean;
  hasError: boolean;
  isComplete: boolean;
  hasResult: boolean;
  hasMatches: boolean;
}

export const useScreenshotSearch = (key?: string): UseScreenshotSearchReturn => {
  const [searchState, setSearchState] = useState<ScreenshotSearchState>('initial');
  const [searchError, setSearchError] = useState('');
  const [searchResult, setSearchResult] = useState<ScreenshotSearchResult | null>(null);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<{ [filename: string]: string }>({});
  const [searchProgress, setSearchProgress] = useState<ScreenshotSearchProgress>(DEFAULT_PROGRESS);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isResetting, setIsResetting] = useState(false);

  // Helper function to reset all state
  const resetState = useCallback(() => {
    setSearchError('');
    setSearchState('initial');
    setSearchResult(null);
    setUploadedImageUrls({});
    setSearchProgress(DEFAULT_PROGRESS);
    setSelectedFiles([]);
  }, []);

  // Computed boolean states
  const isLoading = searchState === 'searching';
  const hasError = searchState === 'error';
  const isComplete = searchState === 'done';
  const hasResult = !!searchResult;
  const hasMatches = !!(searchResult?.matches?.length);

  // Reset state when key changes - but preserve uploaded images
  useEffect(() => {
    if (key) {
      // Don't reset uploaded images when key changes
      setSearchError('');
      setSearchState('initial');
      setSearchResult(null);
      setSearchProgress(DEFAULT_PROGRESS);
      setSelectedFiles([]);
    }
  }, [key]);

  // Start vector search process
  const startSearch = useCallback(async (videoPath: string, imagesPaths: string[]) => {
    // Don't reset uploaded images when starting search
    setSearchError('');
    setSearchState('searching');
    setSearchResult(null);
    setSearchProgress(DEFAULT_PROGRESS);
    setSearchProgress({
      ...DEFAULT_PROGRESS,
      eta: 'N/A',
      processingMethod: 'Starting vector search...',
    });

    try {
      if (!key) {
        throw new Error('No key available for vector search');
      }
      
      const response = await fetch('http://localhost:9000/start_vector_search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key, video_path: videoPath, images_path: imagesPaths }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Vector search failed to start');
      }

      const result = await response.json();
      if (result.result === 'already_running') {
        throw new Error('Vector search is already running');
      } else if (result.result !== 'ok') {
        throw new Error(result.message || 'Failed to start vector search');
      }

      console.log('Vector search started successfully');
    } catch (e: any) {
      setSearchError(e.message || 'Vector search failed to start');
      setSearchState('error');
    }
  }, [key, resetState]);

  // Polling logic inside useEffect
  useEffect(() => {
    let interval: number;

    const pollSearch = async () => {
      try {
        if (!key) {
          throw new Error('No key available for polling');
        }
        
        const response = await fetch(`http://localhost:9000/poll_vector_search?key=${encodeURIComponent(key)}`);
        
        if (!response.ok) {
          throw new Error('Failed to poll vector search status');
        }

        const data = await response.json();
        const { result } = data;
        const { finished, in_progress } = result;

        setSearchProgress(prev => ({
          ...prev,
          finished,
          in_progress,
          processingMethod: finished ? 'Search completed' : 'Searching...',
        }));

        if (finished) {
          // Fetch results from the backend
          try {
            const resultsResponse = await fetch(`http://localhost:9000/vector_search_results?key=${encodeURIComponent(key)}`);
            if (resultsResponse.ok) {
              const response = await resultsResponse.json();
              const { result: resultStatus, data: searchData, metadata } = response;
              
              if (resultStatus === 'ok' && searchData) {
                console.log('Vector search results:', searchData);
                console.log('Vector search metadata:', metadata);
                
                // Transform backend data to match our interface
                const matches = transformSearchData(searchData);

                setSearchResult({
                  matches,
                  totalMatches: matches.length,
                  searchDuration: 0, // Could be calculated from metadata
                  searchMethod: 'deep_learning',
                  processingTime: 0, // Could be calculated from metadata
                  data: searchData,
                  metadata,
                });
              } else {
                console.log('No vector search results available yet');
                setSearchResult(createEmptySearchResult());
              }
            } else {
              throw new Error('Failed to fetch vector search results');
            }
          } catch (error) {
            console.error('Error fetching vector search results:', error);
            setSearchError('Failed to fetch search results');
            setSearchState('error');
            return;
          }

          setSearchState('done');
          setSearchProgress(prev => ({ ...prev, progress: 100 }));
          clearInterval(interval);
        }
      } catch (e: any) {
        clearInterval(interval);
        setSearchError(e.message || 'Polling failed');
        setSearchState('error');
      }
    };

    if (searchState === 'searching') {
      interval = setInterval(pollSearch, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [searchState, key]);

  // Reset search state
  const resetSearch = useCallback(async () => {
    setIsResetting(true);
    try {
      // You might want to add a reset endpoint to your backend
      // await fetch('http://localhost:9000/reset_vector_search', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      // });
    } catch (e) {
      // Optionally handle/log error, but always reset local state
    }
    // Reset everything except uploaded images
    setSearchError('');
    setSearchState('initial');
    setSearchResult(null);
    setSearchProgress(DEFAULT_PROGRESS);
    setSelectedFiles([]);
    setIsResetting(false);
  }, []);

  const takeScreenshot = useCallback(async (): Promise<string> => {
    // Simulate taking a screenshot
    await new Promise(res => setTimeout(res, 200));
    
    // Return a mock screenshot URL or data with key included
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const keySuffix = key ? `-${key}` : '';
    return `screenshot-${timestamp}${keySuffix}.png`;
  }, [key]);

  const jumpToTimestamp = useCallback(async (timestamp: string): Promise<void> => {
    // Simulate jumping to a specific timestamp in the video
    await new Promise(res => setTimeout(res, 150));
    
    // In a real implementation, this would control the video player
    console.log(`Jumping to timestamp: ${timestamp}`);
  }, []);

  const addUploadedImage = useCallback((filename: string, fileUrl: string) => {
    console.log('addUploadedImage called with:', filename, fileUrl);
    setUploadedImageUrls(prev => {
      const updated = {
        ...prev,
        [filename]: fileUrl
      };
      console.log('Updated uploadedImageUrls:', updated);
      return updated;
    });
  }, []);

  return {
    searchState,
    searchError,
    searchResult,
    searchProgress,
    uploadedImageUrls,
    startSearch,
    resetSearch,
    takeScreenshot,
    jumpToTimestamp,
    addUploadedImage,
    selectedFiles,
    setSelectedFiles,
    isResetting,
    isLoading,
    hasError,
    isComplete,
    hasResult,
    hasMatches,
  };
}; 