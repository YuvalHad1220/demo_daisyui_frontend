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
  updateVideoMetadata: (duration?: number, width?: number, height?: number) => void;
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


  const uploadFile = useCallback(async (file: File) => {
    setLoading(true);
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
          
          const url = URL.createObjectURL(file); // Still use this for local preview
          
          const uploaded: VideoFile = {
            name: keyData.filename,
            size: keyData.file_size || file.size, // Use backend size if available, fallback to file size
            type: keyData.content_type,
            url,
            saved_path: keyData.saved_path,
            key: keyData.key,
          };

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
      const url = URL.createObjectURL(file); // Still use this for local preview

      const uploaded: VideoFile = {
        name: result.filename,
        size: file.size, // Backend doesn't return size, so use original file size
        type: result.content_type,
        url,
        saved_path: result.saved_path, // Store the saved path from backend
        key: result.key, // Store the key from backend response
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