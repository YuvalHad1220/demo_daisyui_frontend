import { useState, useCallback } from 'react';

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  url?: string;
  [key: string]: any;
}

export interface VideoFile extends UploadedFile {
  duration?: number;
  width?: number;
  height?: number;
}

export type UploadState = 'initial' | 'uploading' | 'uploaded' | 'error';

interface FileUploadHookReturn {
  // State
  uploadState: UploadState;
  uploadedFile: VideoFile | null;
  uploadProgress: number;
  error: string;
  isLoading: boolean;
  
  // Actions
  setUploadState: (state: UploadState) => Promise<void>;
  setUploadedFile: (file: VideoFile | null) => Promise<void>;
  setUploadProgress: (progress: number) => Promise<void>;
  setError: (error: string) => Promise<void>;
  resetUpload: () => Promise<void>;
  
  // Helpers
  updateVideoMetadata: (duration?: number, width?: number, height?: number) => Promise<void>;
}

export const useFileUpload = (): FileUploadHookReturn => {
  const [uploadState, setUploadStateInternal] = useState<UploadState>('initial');
  const [uploadedFile, setUploadedFileInternal] = useState<VideoFile | null>(null);
  const [uploadProgress, setUploadProgressInternal] = useState<number>(0);
  const [error, setErrorInternal] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Async wrapper for backend sync
  const syncWithBackend = useCallback(async (action: string, data?: any) => {
    try {
      setIsLoading(true);
      
      // TODO: Replace with actual backend API call
      console.log(`Syncing with backend: ${action}`, data);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Here you would make the actual API call
      // const response = await fetch('/api/file-upload', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ action, data })
      // });
      // 
      // if (!response.ok) {
      //   throw new Error('Failed to sync with backend');
      // }
      
      return true;
    } catch (error) {
      console.error('Backend sync failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setUploadState = useCallback(async (state: UploadState) => {
    try {
      await syncWithBackend('setUploadState', { state });
      setUploadStateInternal(state);
    } catch (error) {
      console.error('Failed to set upload state:', error);
      throw error;
    }
  }, [syncWithBackend]);

  const setUploadedFile = useCallback(async (file: VideoFile | null) => {
    try {
      // Don't send the blob URL to backend, just metadata
      const fileData = file ? {
        name: file.name,
        size: file.size,
        type: file.type,
        duration: file.duration,
        width: file.width,
        height: file.height
      } : null;
      
      await syncWithBackend('setUploadedFile', { file: fileData });
      setUploadedFileInternal(file);
    } catch (error) {
      console.error('Failed to set uploaded file:', error);
      throw error;
    }
  }, [syncWithBackend]);

  const setUploadProgress = useCallback(async (progress: number) => {
    try {
      await syncWithBackend('setUploadProgress', { progress });
      setUploadProgressInternal(progress);
    } catch (error) {
      console.error('Failed to set upload progress:', error);
      throw error;
    }
  }, [syncWithBackend]);

  const setError = useCallback(async (error: string) => {
    try {
      await syncWithBackend('setError', { error });
      setErrorInternal(error);
    } catch (error) {
      console.error('Failed to set error:', error);
      throw error;
    }
  }, [syncWithBackend]);

  const resetUpload = useCallback(async () => {
    try {
      await syncWithBackend('resetUpload');
      setUploadStateInternal('initial');
      setUploadedFileInternal(null);
      setUploadProgressInternal(0);
      setErrorInternal('');
    } catch (error) {
      console.error('Failed to reset upload:', error);
      throw error;
    }
  }, [syncWithBackend]);

  const updateVideoMetadata = useCallback(async (duration?: number, width?: number, height?: number) => {
    try {
      const metadata = { duration, width, height };
      await syncWithBackend('updateVideoMetadata', metadata);
      
      setUploadedFileInternal(prev => prev ? {
        ...prev,
        ...(duration !== undefined && { duration }),
        ...(width !== undefined && { width }),
        ...(height !== undefined && { height })
      } : null);
    } catch (error) {
      console.error('Failed to update video metadata:', error);
      throw error;
    }
  }, [syncWithBackend]);

  return {
    // State
    uploadState,
    uploadedFile,
    uploadProgress,
    error,
    isLoading,
    
    // Actions
    setUploadState,
    setUploadedFile,
    setUploadProgress,
    setError,
    resetUpload,
    
    // Helpers
    updateVideoMetadata
  };
}; 