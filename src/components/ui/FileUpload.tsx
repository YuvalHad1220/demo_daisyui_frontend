import React, { useRef, useCallback } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import { Upload, Video, Monitor, HardDrive, Clock, AlertCircle, Loader } from 'lucide-react';
import { StageCard } from './StageCard';
import { ProgressBar } from './ProgressBar';

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  url?: string;
  [key: string]: any; // Allow additional propertiesm
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
  onFileSelect?: (file: File) => void | Promise<void>;
  onReset?: () => void | Promise<void>;
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
  loading?: boolean;
  resetting?: boolean;
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
  onReset,
  title = "File Upload",
  buttonText = "Upload File",
  dragText = "Drag and drop or click to select",
  sizeText,
  showResetButton = true,
  customValidation,
  className = "",
  children,
  videoFile,
  currentUploadState,
  currentUploadProgress,
  currentError,
  loading = false,
  resetting = false
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Use only props for state
  const actualUploadState = currentUploadState;
  const actualError = currentError;
  const actualUploadedFile = videoFile;

  const isVideo = actualUploadedFile?.type?.startsWith('video/') || false;
  const cardTitle = actualUploadState === 'uploaded' && isVideo ? 'Source Video' : title;
  const cardIcon = isVideo ? Video : Upload;
  const resetTitle = isVideo ? 'Change Video' : 'Change File';

  const validateFile = useCallback((file: File): string | null => {
    if (customValidation) {
      const customError = customValidation(file);
      if (customError) return customError;
    }
    if (allowedTypes && !allowedTypes.includes(file.type)) {
      return `File type not supported. Allowed types: ${allowedTypes.join(', ')}`;
    }
    const maxSizeBytes = maxSize || (maxSizeMB ? maxSizeMB * 1024 * 1024 : undefined);
    if (maxSizeBytes && file.size > maxSizeBytes) {
      const maxSizeMB = Math.round(maxSizeBytes / (1024 * 1024));
      return `File size must be less than ${maxSizeMB}MB`;
    }
    return null;
  }, [allowedTypes, maxSize, maxSizeMB, customValidation]);

  const handleFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && !loading) {
      const validationError = validateFile(file);
      if (!validationError) {
        onFileSelect?.(file);
      }
    }
  }, [onFileSelect, validateFile, loading]);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && !loading) {
      const validationError = validateFile(file);
      if (!validationError) {
        onFileSelect?.(file);
      }
    }
  }, [onFileSelect, validateFile, loading]);



  return (
    <StageCard
      title={cardTitle}
      icon={cardIcon}
      showReset={actualUploadState === 'uploaded' && showResetButton}
      resetTitle={resetTitle}
      onResetClick={onReset}
      resetting={resetting}
      className={className}
    >
      {/* Content Area */}
      <div className="p-6 flex-1">
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
              onClick={() => !loading && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                className="hidden"
                onChange={handleFileSelect}
                disabled={loading}
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
                  disabled={loading}
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

        {/* Uploaded State - File Info */}
        {actualUploadState === 'uploaded' && actualUploadedFile && !children && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-1" style={{ color: '#111827' }}>
                {actualUploadedFile.name}
              </h3>
            </div>
            {isVideo && (
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg border" style={{ borderColor: '#e5e7eb' }}>
                  <div className="w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: '#f0fdf4' }}>
                    <Monitor className="w-5 h-5" style={{ color: '#22c55e' }} />
                  </div>
                  <p className="text-xs font-medium mb-1" style={{ color: '#6b7280' }}>Resolution</p>
                  <p className="text-sm font-semibold" style={{ color: '#111827' }}>
                    {actualUploadedFile.width && actualUploadedFile.height ? `${actualUploadedFile.width}×${actualUploadedFile.height}` : '--'}
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg border" style={{ borderColor: '#e5e7eb' }}>
                  <div className="w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: '#faf5ff' }}>
                    <HardDrive className="w-5 h-5" style={{ color: '#7c3aed' }} />
                  </div>
                  <p className="text-xs font-medium mb-1" style={{ color: '#6b7280' }}>Size</p>
                  <p className="text-sm font-semibold" style={{ color: '#111827' }}>
                    {actualUploadedFile.size ? `${(actualUploadedFile.size / (1024 * 1024)).toFixed(1)} MB` : '--'}
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg border" style={{ borderColor: '#e5e7eb' }}>
                  <div className="w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: '#dbeafe' }}>
                    <Clock className="w-5 h-5" style={{ color: '#2563eb' }} />
                  </div>
                  <p className="text-xs font-medium mb-1" style={{ color: '#6b7280' }}>Length</p>
                  <p className="text-sm font-semibold" style={{ color: '#111827' }}>
                    {actualUploadedFile.duration ?
                      `${Math.floor(actualUploadedFile.duration / 60)}:${Math.floor(actualUploadedFile.duration % 60).toString().padStart(2, '0')}` :
                      '--:--'}
                  </p>
                </div>
              </div>
            )}
            {!isVideo && (
              <div className="text-center p-4 rounded-lg border" style={{ borderColor: '#e5e7eb' }}>
                <p className="text-sm font-semibold" style={{ color: '#111827' }}>
                  {actualUploadedFile.size ? `${(actualUploadedFile.size / (1024 * 1024)).toFixed(1)} MB` : '--'}
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
              onClick={onReset}
              className="w-full px-4 py-3 border rounded-lg text-sm font-semibold transition-colors hover:bg-gray-50 disabled:opacity-50"
              style={{ color: '#374151', borderColor: '#d1d5db' }}
              disabled={loading}
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* Uploading Loading Bar (indeterminate) */}
      {actualUploadState === 'uploading' && (
        <div className="px-6 pb-6 flex-shrink-0">
          <div className="space-y-4">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center space-x-2">
                <Loader className="w-5 h-5 animate-spin" style={{ color: '#f59e42' }} />
                <span className="font-semibold" style={{ color: '#111827' }}>Uploading video...</span>
              </div>
              <ProgressBar />
              <p className="text-sm font-medium" style={{ color: '#6b7280' }}>
                Processing...
              </p>
            </div>
          </div>
        </div>
      )}
    </StageCard>
  );
}; 