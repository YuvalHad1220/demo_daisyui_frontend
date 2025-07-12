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
  finished?: boolean;
}

export type UploadState = 'initial' | 'uploading' | 'uploaded' | 'error';

// Helper function to create VideoFile objects
const createVideoFile = (data: any, file?: File): VideoFile => {
  return {
    name: data.filename,
    size: data.file_size || file?.size || 0,
    type: data.content_type,
    url: file ? URL.createObjectURL(file) : undefined,
    saved_path: data.saved_path,
    key: data.key,
  };
};

interface FileUploadHookReturn {
  uploadState: UploadState;
  uploadedFile: VideoFile | null;
  uploadProgress: number;
  error: string;
  uploadFile: (file: File) => Promise<void>;
  reset: () => Promise<void>;
  updateVideoMetadata: (duration?: number, width?: number, height?: number) => void;
  finished: boolean;
  loading: boolean;
}


export const useFileUpload = (): FileUploadHookReturn => {
  const [uploadState, setUploadState] = useState<UploadState>('initial');
  const [uploadedFile, setUploadedFile] = useState<VideoFile | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string>('');


  const uploadFile = useCallback(async (file: File) => {
    setError('');
    setUploadState('uploading');
    setUploadProgress(0);
    
    try {
      // First, try to get or create key for existing file
      const getKeyResponse = await fetch('http://localhost:9000/get_or_create_key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name }),
      });

      if (getKeyResponse.ok) {
        const keyData = await getKeyResponse.json();
        
        if (keyData.result === 'ok') {
          // File already exists on disk, use existing session
          console.log(`File '${file.name}' already exists, using existing session with key '${keyData.key}'`);
          
          const uploaded = createVideoFile(keyData, file);

          setUploadedFile(uploaded);
          setUploadState('uploaded');
          setUploadProgress(100);
          setError('');
          return; // Exit early, no need to upload
        } else if (keyData.result === 'not_found') {
          // File doesn't exist, proceed with upload
          console.log(`File '${file.name}' not found, proceeding with upload`);
        }
      }

      // File doesn't exist or get_or_create_key failed, proceed with upload
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:9000/upload_video', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }

      const result = await response.json();
      const uploaded = createVideoFile(result, file);

      setUploadedFile(uploaded);
      setUploadState('uploaded');
      setUploadProgress(100);
      setError('');
    } catch (e: any) {
      setError(e.message || 'Upload failed');
      setUploadState('error');
    }
  }, []);

  const reset = useCallback(async () => {
    setUploadState('uploading');
    try {
      const key = uploadedFile?.key;
      if (!key) {
        throw new Error('No key available for reset');
      }

      const response = await fetch('http://localhost:9000/reset_file_upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reset');
      }

      // Reset frontend state
      setUploadState('initial');
      setUploadedFile(null);
      setUploadProgress(0);
      setError('');
    } catch (e: any) {
      setError(e.message || 'Failed to reset');
      setUploadState('error');
    }
  }, [uploadedFile?.key]);

  const updateVideoMetadata = useCallback((duration?: number, width?: number, height?: number) => {
    setUploadedFile(prev => prev ? {
      ...prev,
      ...(duration !== undefined && { duration }),
      ...(width !== undefined && { width }),
      ...(height !== undefined && { height })
    } : null);
  }, []);

  const finished =
    uploadState === 'uploaded' &&
    !!uploadedFile &&
    typeof uploadedFile.width === 'number' &&
    typeof uploadedFile.height === 'number' &&
    typeof uploadedFile.duration === 'number';

  const loading = uploadState === 'uploading';

  return {
    uploadState,
    uploadedFile,
    uploadProgress,
    error,
    uploadFile,
    reset,
    updateVideoMetadata,
    finished,
    loading,
  };
}; 