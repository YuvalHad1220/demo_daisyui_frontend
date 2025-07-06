import React, { useState, useRef, useCallback } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import { Upload, Loader, AlertCircle, Video, Monitor, HardDrive, Clock } from 'lucide-react';
import { StageCard } from './StageCard';

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  url?: string;
  [key: string]: any; // Allow additional properties
}

export interface VideoFile extends UploadedFile {
  duration?: number;
  width?: number;
  height?: number;
}

export type UploadState = 'initial' | 'uploading' | 'uploaded' | 'error';

export interface FileUploadConfig {
  accept?: string;
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  maxSizeMB?: number; // convenience prop
  onFileSelect?: (file: UploadedFile) => void | Promise<void>;
  onUploadStart?: () => void | Promise<void>;
  onUploadComplete?: (file: UploadedFile) => void | Promise<void>;
  onUploadError?: (error: string) => void | Promise<void>;
  onReset?: () => void | Promise<void>;
  onProgressUpdate?: (progress: number) => void | Promise<void>;
  uploadDuration?: number; // milliseconds
  title?: string;
  subtitle?: string;
  buttonText?: string;
  dragText?: string;
  sizeText?: string;
  showResetButton?: boolean;
  showProgress?: boolean;
  customValidation?: (file: File) => string | null; // returns error message or null
  videoFile?: VideoFile | null; // For video-specific display
  // External state props
  currentUploadState?: UploadState;
  currentUploadProgress?: number;
  currentError?: string;
  isLoading?: boolean;
}

interface FileUploadProps extends FileUploadConfig {
  className?: string;
  children?: React.ReactNode;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  accept = "*/*",
  maxSize,
  maxSizeMB,
  allowedTypes,
  onFileSelect,
  onUploadStart,
  onUploadComplete,
  onUploadError,
  onReset,
  onProgressUpdate,
  uploadDuration = 2000,
  title = "File Upload",
  subtitle = "Drag and drop or click to select",
  buttonText = "Upload File",
  dragText = "Drag and drop or click to select",
  sizeText,
  showResetButton = true,
  showProgress = true,
  customValidation,
  className = "",
  children,
  videoFile,
  currentUploadState,
  currentUploadProgress,
  currentError,
  isLoading = false
}) => {
  const [uploadState, setUploadState] = useState<UploadState>('initial');
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [internalLoading, setInternalLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Use external state if provided, otherwise use internal state
  const actualUploadState = currentUploadState ?? uploadState;
  const actualUploadProgress = currentUploadProgress ?? uploadProgress;
  const actualError = currentError ?? error;
  const actualUploadedFile = videoFile ?? uploadedFile;
  const actualIsLoading = isLoading || internalLoading;

  const validateFile = useCallback((file: File): string | null => {
    // Custom validation
    if (customValidation) {
      const customError = customValidation(file);
      if (customError) return customError;
    }

    // Type validation
    if (allowedTypes && !allowedTypes.includes(file.type)) {
      return `File type not supported. Allowed types: ${allowedTypes.join(', ')}`;
    }

    // Size validation
    const maxSizeBytes = maxSize || (maxSizeMB ? maxSizeMB * 1024 * 1024 : undefined);
    if (maxSizeBytes && file.size > maxSizeBytes) {
      const maxSizeMB = Math.round(maxSizeBytes / (1024 * 1024));
      return `File size must be less than ${maxSizeMB}MB`;
    }

    return null;
  }, [allowedTypes, maxSize, maxSizeMB, customValidation]);

  const handleFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, []);

  const handleFile = useCallback(async (file: File) => {
    setError('');
    setInternalLoading(true);
    
    try {
      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setUploadState('error');
        await onUploadError?.(validationError);
        return;
      }

      setUploadState('uploading');
      setUploadProgress(0);
      await onUploadStart?.();

      // Create object URL
      const url = URL.createObjectURL(file);

      // Simulate upload progress
      const interval = setInterval(async () => {
        setUploadProgress(prev => {
          const newProgress = Math.min(prev + Math.random() * 15 + 5, 100);
          
          // Update progress asynchronously
          if (onProgressUpdate) {
            const result = onProgressUpdate(newProgress);
            if (result instanceof Promise) {
              result.catch((error: any) => {
                console.error('Failed to update progress:', error);
              });
            }
          }
          
          if (newProgress >= 100) {
            clearInterval(interval);
            
            const uploadedFileData: UploadedFile = {
              name: file.name,
              size: file.size,
              type: file.type,
              url
            };
            
            setUploadedFile(uploadedFileData);
            setUploadState('uploaded');
            
            // Call async callbacks
            Promise.all([
              onUploadComplete?.(uploadedFileData),
              onFileSelect?.(uploadedFileData)
            ]).catch(error => {
              console.error('Upload completion callbacks failed:', error);
            });
            
            return 100;
          }
          
          return newProgress;
        });
      }, uploadDuration / 20); // Divide by 20 to get reasonable progress steps
    } catch (error) {
      console.error('File handling failed:', error);
      setError('Upload failed');
      setUploadState('error');
      await onUploadError?.('Upload failed');
    } finally {
      setInternalLoading(false);
    }
  }, [validateFile, onUploadStart, onUploadComplete, onFileSelect, onUploadError, onProgressUpdate, uploadDuration]);

  const handleReset = useCallback(async () => {
    setInternalLoading(true);
    
    try {
      setUploadState('initial');
      setUploadedFile(null);
      setUploadProgress(0);
      setError('');
      
      if (actualUploadedFile?.url) {
        URL.revokeObjectURL(actualUploadedFile.url);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      await onReset?.();
    } catch (error) {
      console.error('Reset failed:', error);
    } finally {
      setInternalLoading(false);
    }
  }, [actualUploadedFile, onReset]);

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const formatDuration = useCallback((seconds: number | null | undefined) => {
    if (!seconds) return '--:--';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  const getResolutionText = useCallback((width?: number, height?: number) => {
    if (!width || !height) return '--';
    
    // Determine resolution label
    if (width >= 3840 && height >= 2160) return `${width}×${height} (4K)`;
    if (width >= 1920 && height >= 1080) return `${width}×${height} (FHD)`;
    if (width >= 1280 && height >= 720) return `${width}×${height} (HD)`;
    return `${width}×${height}`;
  }, []);

  const isVideo = actualUploadedFile?.type?.startsWith('video/') || videoFile;

  // Determine the card title and icon
  const cardTitle = actualUploadState === 'uploaded' && isVideo ? 'Source Video' : title;
  const cardIcon = isVideo ? Video : Upload;
  const resetTitle = isVideo ? 'Change Video' : 'Change File';

  return (
    <StageCard
      title={cardTitle}
      icon={cardIcon}
      showReset={actualUploadState === 'uploaded' && showResetButton && !actualIsLoading}
      resetTitle={resetTitle}
      onResetClick={handleReset}
      className={className}
    >
      {/* Loading Overlay */}
      {actualIsLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
          <div className="flex items-center space-x-2">
            <Loader className="w-5 h-5 animate-spin" style={{ color: '#14b8a6' }} />
            <span className="text-sm font-medium" style={{ color: '#374151' }}>
              Syncing...
            </span>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="p-6 flex-1">
        {/* Custom children or default content */}
        {children ? (
          children
        ) : (
          <div className="aspect-video bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden border" style={{ borderColor: '#e5e7eb' }}>
            {actualUploadState === 'uploaded' && actualUploadedFile?.url && isVideo ? (
              <video
                src={actualUploadedFile.url}
                className="w-full h-full object-contain rounded-lg"
                controls
              />
            ) : actualUploadState === 'uploaded' && actualUploadedFile?.url ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-lg mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#f0fdfa' }}>
                    <Upload className="w-8 h-8" style={{ color: '#14b8a6' }} />
                  </div>
                  <p className="text-sm font-medium" style={{ color: '#374151' }}>
                    {actualUploadedFile.name}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-3 opacity-40">
                {isVideo ? (
                  <Video className="w-12 h-12" style={{ color: '#9ca3af' }} />
                ) : (
                  <Upload className="w-12 h-12" style={{ color: '#9ca3af' }} />
                )}
                <p className="text-sm font-medium" style={{ color: '#9ca3af' }}>
                  {isVideo ? 'Video Preview' : 'File Preview'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 pb-6 flex-shrink-0">
        {/* Upload State */}
        {actualUploadState === 'initial' && (
          <div className="space-y-6">
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer hover:border-gray-400 hover:bg-gray-50"
              style={{ borderColor: '#d1d5db' }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => !actualIsLoading && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                className="hidden"
                onChange={handleFileSelect}
                disabled={actualIsLoading}
              />
              <div className="flex flex-col items-center space-y-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: '#f0fdfa' }}
                >
                  <Upload className="w-6 h-6" style={{ color: '#14b8a6' }} />
                </div>
                <button
                  className="px-8 py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
                    boxShadow: '0 4px 6px -1px rgba(20, 184, 166, 0.1)'
                  }}
                  disabled={actualIsLoading}
                >
                  {buttonText}
                </button>
                <div className="space-y-1">
                  <p className="text-sm font-medium" style={{ color: '#374151' }}>
                    {dragText}
                  </p>
                  {sizeText && (
                    <p className="text-xs" style={{ color: '#6b7280' }}>
                      {sizeText}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Uploading State */}
        {actualUploadState === 'uploading' && showProgress && (
          <div className="space-y-4">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center space-x-2">
                <Loader className="w-5 h-5 animate-spin" style={{ color: '#f59e42' }} />
                <span className="font-semibold" style={{ color: '#111827' }}>
                  {isVideo ? 'Uploading video...' : 'Uploading file...'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all duration-300"
                  style={{
                    background: 'linear-gradient(90deg, #f59e42 0%, #f97316 100%)',
                    width: `${actualUploadProgress}%`
                  }}
                />
              </div>
              <p className="text-sm font-medium" style={{ color: '#6b7280' }}>
                {Math.round(actualUploadProgress)}% complete
              </p>
            </div>
          </div>
        )}

        {/* Uploaded State - File Info */}
        {actualUploadState === 'uploaded' && (actualUploadedFile || videoFile) && !children && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-1" style={{ color: '#111827' }}>
                {(videoFile || actualUploadedFile)?.name}
              </h3>
            </div>
            
            {/* Video-specific cards layout */}
            {isVideo && (videoFile || actualUploadedFile) && (
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg border" style={{ borderColor: '#e5e7eb' }}>
                  <div className="w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: '#f0fdf4' }}>
                    <Monitor className="w-5 h-5" style={{ color: '#22c55e' }} />
                  </div>
                  <p className="text-xs font-medium mb-1" style={{ color: '#6b7280' }}>Resolution</p>
                  <p className="text-sm font-semibold" style={{ color: '#111827' }}>
                    {getResolutionText((videoFile as VideoFile)?.width, (videoFile as VideoFile)?.height)}
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg border" style={{ borderColor: '#e5e7eb' }}>
                  <div className="w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: '#faf5ff' }}>
                    <HardDrive className="w-5 h-5" style={{ color: '#7c3aed' }} />
                  </div>
                  <p className="text-xs font-medium mb-1" style={{ color: '#6b7280' }}>Size</p>
                  <p className="text-sm font-semibold" style={{ color: '#111827' }}>
                    {formatFileSize((videoFile || actualUploadedFile)?.size || 0)}
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg border" style={{ borderColor: '#e5e7eb' }}>
                  <div className="w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: '#dbeafe' }}>
                    <Clock className="w-5 h-5" style={{ color: '#2563eb' }} />
                  </div>
                  <p className="text-xs font-medium mb-1" style={{ color: '#6b7280' }}>Length</p>
                  <p className="text-sm font-semibold" style={{ color: '#111827' }}>
                    {formatDuration((videoFile as VideoFile)?.duration)}
                  </p>
                </div>
              </div>
            )}

            {/* Default file info for non-video files */}
            {!isVideo && (
              <div className="text-center p-4 rounded-lg border" style={{ borderColor: '#e5e7eb' }}>
                <p className="text-sm font-semibold" style={{ color: '#111827' }}>
                  {formatFileSize(actualUploadedFile?.size || 0)}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Error State */}
        {actualUploadState === 'error' && (
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 rounded-lg border" style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#fee2e2' }}>
                <AlertCircle className="w-4 h-4" style={{ color: '#ef4444' }} />
              </div>
              <div>
                <p className="font-semibold" style={{ color: '#dc2626' }}>Upload Failed</p>
                <p className="text-sm" style={{ color: '#991b1b' }}>{actualError}</p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="w-full px-4 py-3 border rounded-lg text-sm font-semibold transition-colors hover:bg-gray-50 disabled:opacity-50"
              style={{ color: '#374151', borderColor: '#d1d5db' }}
              disabled={actualIsLoading}
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </StageCard>
  );
}; 