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
  finished?: boolean;
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
  finished: boolean;
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
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://127.0.0.1:9000/upload_video', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }

      const result = await response.json();
      const url = URL.createObjectURL(file); // Still use this for local preview

      const uploaded: VideoFile = {
        name: result.filename,
        size: file.size, // Backend doesn't return size, so use original file size
        type: result.content_type,
        url,
        saved_path: result.saved_path, // Store the saved path from backend
      };

      setUploadedFile(uploaded);
      setUploadState('uploaded');
      setUploadProgress(100); // Assuming full progress on successful upload
      setError('');
    } catch (e: any) {
      setError(e.message || 'Upload failed');
      setUploadState('error');
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:9000/reset_file_upload', {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reset');
      }

      // Assuming success, reset frontend state
      setUploadState(initialState.uploadState);
      setUploadedFile(initialState.uploadedFile);
      setUploadProgress(initialState.uploadProgress);
      setError(initialState.error);
    } catch (e: any) {
      setError(e.message || 'Failed to reset');
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

  const finished =
    uploadState === 'uploaded' &&
    !!uploadedFile &&
    typeof uploadedFile.width === 'number' &&
    typeof uploadedFile.height === 'number' &&
    typeof uploadedFile.duration === 'number';

  const result = useMemo(() => ({
    loading,
    uploadState,
    uploadedFile,
    uploadProgress,
    error,
    uploadFile,
    reset,
    updateVideoMetadata,
    finished,
  }), [loading, uploadState, uploadedFile, uploadProgress, error, uploadFile, reset, updateVideoMetadata, finished]);

  return result;
}; 