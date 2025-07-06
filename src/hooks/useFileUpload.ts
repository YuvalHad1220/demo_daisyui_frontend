import { useState, useCallback, useMemo } from 'react';

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
  loading: boolean;
  uploadState: UploadState;
  uploadedFile: VideoFile | null;
  uploadProgress: number;
  error: string;
  uploadFile: (file: File) => Promise<void>;
  reset: () => Promise<void>;
  updateVideoMetadata: (duration?: number, width?: number, height?: number) => Promise<void>;
}

const initialState = {
  uploadState: 'initial' as UploadState,
  uploadedFile: null as VideoFile | null,
  uploadProgress: 0,
  error: '',
};

export const useFileUpload = (): FileUploadHookReturn => {
  const [loading, setLoading] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>(initialState.uploadState);
  const [uploadedFile, setUploadedFile] = useState<VideoFile | null>(initialState.uploadedFile);
  const [uploadProgress, setUploadProgress] = useState<number>(initialState.uploadProgress);
  const [error, setError] = useState<string>(initialState.error);

  // Simulate backend API
  const fakeApi = async (data: any, ms = 600) => {
    await new Promise(res => setTimeout(res, ms));
    return data;
  };

  const uploadFile = useCallback(async (file: File) => {
    setLoading(true);
    setError('');
    setUploadState('uploading');
    setUploadProgress(0);
    try {
      // Simulate backend upload
      let progress = 0;
      while (progress < 100) {
        await fakeApi(null, 80);
        progress = Math.min(progress + Math.random() * 30 + 10, 100);
        setUploadProgress(Math.round(progress));
      }
      // Simulate backend response with file info
      const url = URL.createObjectURL(file);
      const uploaded: VideoFile = {
        name: file.name,
        size: file.size,
        type: file.type,
        url,
      };
      await fakeApi(uploaded, 400);
      setUploadedFile(uploaded);
      setUploadState('uploaded');
      setError('');
    } catch (e) {
      setError('Upload failed');
      setUploadState('error');
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(async () => {
    setLoading(true);
    try {
      await fakeApi(null, 300);
      setUploadState(initialState.uploadState);
      setUploadedFile(initialState.uploadedFile);
      setUploadProgress(initialState.uploadProgress);
      setError(initialState.error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateVideoMetadata = useCallback(async (duration?: number, width?: number, height?: number) => {
    setLoading(true);
    try {
      await fakeApi(null, 200);
      setUploadedFile(prev => prev ? {
        ...prev,
        ...(duration !== undefined && { duration }),
        ...(width !== undefined && { width }),
        ...(height !== undefined && { height })
      } : null);
    } finally {
      setLoading(false);
    }
  }, []);

  const result = useMemo(() => ({
    loading,
    uploadState,
    uploadedFile,
    uploadProgress,
    error,
    uploadFile,
    reset,
    updateVideoMetadata,
  }), [loading, uploadState, uploadedFile, uploadProgress, error, uploadFile, reset, updateVideoMetadata]);

  return result;
}; 