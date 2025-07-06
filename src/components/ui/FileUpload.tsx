import React, { useState, useRef, useCallback } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import { Upload, RotateCcw, Loader, AlertCircle } from 'lucide-react';

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  url?: string;
  [key: string]: any; // Allow additional properties
}

export type UploadState = 'initial' | 'uploading' | 'uploaded' | 'error';

export interface FileUploadConfig {
  accept?: string;
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  maxSizeMB?: number; // convenience prop
  onFileSelect?: (file: UploadedFile) => void;
  onUploadStart?: () => void;
  onUploadComplete?: (file: UploadedFile) => void;
  onUploadError?: (error: string) => void;
  onReset?: () => void;
  uploadDuration?: number; // milliseconds
  title?: string;
  subtitle?: string;
  buttonText?: string;
  dragText?: string;
  sizeText?: string;
  showResetButton?: boolean;
  showProgress?: boolean;
  customValidation?: (file: File) => string | null; // returns error message or null
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
  children
}) => {
  const [uploadState, setUploadState] = useState<UploadState>('initial');
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const handleFile = useCallback((file: File) => {
    setError('');
    
    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setUploadState('error');
      onUploadError?.(validationError);
      return;
    }

    setUploadState('uploading');
    setUploadProgress(0);
    onUploadStart?.();

    // Create object URL
    const url = URL.createObjectURL(file);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          const uploadedFileData: UploadedFile = {
            name: file.name,
            size: file.size,
            type: file.type,
            url
          };
          setUploadedFile(uploadedFileData);
          setUploadState('uploaded');
          onUploadComplete?.(uploadedFileData);
          onFileSelect?.(uploadedFileData);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, uploadDuration / 20); // Divide by 20 to get reasonable progress steps
  }, [validateFile, onUploadStart, onUploadComplete, onFileSelect, onUploadError, uploadDuration]);

  const handleReset = useCallback(() => {
    setUploadState('initial');
    setUploadedFile(null);
    setUploadProgress(0);
    setError('');
    if (uploadedFile?.url) {
      URL.revokeObjectURL(uploadedFile.url);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onReset?.();
  }, [uploadedFile, onReset]);

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  return (
    <div className={`w-full h-full p-6 ${className}`}>
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden h-full flex flex-col" style={{ borderColor: '#e5e7eb' }}>
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: '#e5e7eb' }}>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f0fdfa' }}>
              <Upload className="w-4 h-4" style={{ color: '#14b8a6' }} />
            </div>
            <h2 className="text-lg font-semibold" style={{ color: '#111827' }}>
              {title}
            </h2>
          </div>
          {uploadState === 'uploaded' && showResetButton && (
            <div className="relative group">
              <button
                onClick={handleReset}
                className="flex items-center justify-center w-8 h-8 rounded-lg border transition-colors hover:bg-gray-50"
                style={{ color: '#6b7280', borderColor: '#d1d5db' }}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium text-gray-700 bg-white border rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-[999]">
                Change File
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
              </div>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="p-6 flex-1">
          {/* Custom children or default content */}
          {children ? (
            children
          ) : (
            <div className="aspect-video bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden border" style={{ borderColor: '#e5e7eb' }}>
              {uploadState === 'uploaded' && uploadedFile?.url ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-lg mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#f0fdfa' }}>
                      <Upload className="w-8 h-8" style={{ color: '#14b8a6' }} />
                    </div>
                    <p className="text-sm font-medium" style={{ color: '#374151' }}>
                      {uploadedFile.name}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-3 opacity-40">
                  <Upload className="w-12 h-12" style={{ color: '#9ca3af' }} />
                  <p className="text-sm font-medium" style={{ color: '#9ca3af' }}>File Preview</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex-shrink-0">
          {/* Upload State */}
          {uploadState === 'initial' && (
            <div className="space-y-6">
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer hover:border-gray-400 hover:bg-gray-50"
                style={{ borderColor: '#d1d5db' }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={accept}
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <div className="flex flex-col items-center space-y-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: '#f0fdfa' }}
                  >
                    <Upload className="w-6 h-6" style={{ color: '#14b8a6' }} />
                  </div>
                  <button
                    className="px-8 py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                    style={{
                      background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
                      boxShadow: '0 4px 6px -1px rgba(20, 184, 166, 0.1)'
                    }}
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
          {uploadState === 'uploading' && showProgress && (
            <div className="space-y-4">
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center space-x-2">
                  <Loader className="w-5 h-5 animate-spin" style={{ color: '#f59e42' }} />
                  <span className="font-semibold" style={{ color: '#111827' }}>Uploading file...</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full transition-all duration-300"
                    style={{
                      background: 'linear-gradient(90deg, #f59e42 0%, #f97316 100%)',
                      width: `${uploadProgress}%`
                    }}
                  />
                </div>
                <p className="text-sm font-medium" style={{ color: '#6b7280' }}>
                  {Math.round(uploadProgress)}% complete
                </p>
              </div>
            </div>
          )}

          {/* Uploaded State - File Info */}
          {uploadState === 'uploaded' && uploadedFile && !children && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-1" style={{ color: '#111827' }}>
                  {uploadedFile.name}
                </h3>
              </div>
              <div className="text-center p-4 rounded-lg border" style={{ borderColor: '#e5e7eb' }}>
                <p className="text-sm font-semibold" style={{ color: '#111827' }}>
                  {formatFileSize(uploadedFile.size)}
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {uploadState === 'error' && (
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-4 rounded-lg border" style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#fee2e2' }}>
                  <AlertCircle className="w-4 h-4" style={{ color: '#ef4444' }} />
                </div>
                <div>
                  <p className="font-semibold" style={{ color: '#dc2626' }}>Upload Failed</p>
                  <p className="text-sm" style={{ color: '#991b1b' }}>{error}</p>
                </div>
              </div>
              <button
                onClick={handleReset}
                className="w-full px-4 py-3 border rounded-lg text-sm font-semibold transition-colors hover:bg-gray-50"
                style={{ color: '#374151', borderColor: '#d1d5db' }}
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 