import React, { useCallback } from 'react';
import { Upload, Video, Monitor, HardDrive, Clock } from 'lucide-react';
import { ErrorAlert } from './ErrorAlert';
import { StageCard } from './StageCard';
import { StateLoader } from './StateLoader';
import { FileInfoCard } from './FileInfoCard';
import { DragAndDrop } from './DragAndDrop';

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

export interface FileUploadProps {
  accept?: string;
  maxSizeMB?: number;
  allowedTypes?: string[];
  title?: string;
  buttonText?: string;
  dragText?: string;
  sizeText?: string;
  onFileSelect: (file: File) => void | Promise<void>;
  onReset?: () => void | Promise<void>;
  videoFile?: VideoFile | null;
  currentUploadState: UploadState;
  currentError?: string;
  loading?: boolean;
  resetting?: boolean;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  accept = "video/*",
  maxSizeMB = 50,
  allowedTypes = ['video/mp4'],
  title = "Video Upload",
  buttonText = "Upload Video",
  dragText = "Drag and drop or click to select",
  sizeText = "Supports MP4, MKV • Maximum 20MB",
  onFileSelect,
  onReset,
  videoFile,
  currentUploadState,
  currentError,
  loading = false,
  resetting = false,
  className = ""
}) => {
  const actualUploadState = currentUploadState;
  const actualError = currentError;
  const actualUploadedFile = videoFile;

  const cardTitle = actualUploadState === 'uploaded' ? 'Source Video' : title;
  const cardIcon = Video;
  const resetTitle = 'Change Video';

  const validateFile = useCallback((file: File): string | null => {
    // More flexible validation for MP4 files
    const isMP4 = file.type === 'video/mp4' || 
                  file.type === 'video/x-mp4' || 
                  file.name.toLowerCase().endsWith('.mp4') ||
                  file.type === 'application/octet-stream' && file.name.toLowerCase().endsWith('.mp4');
    
    if (allowedTypes && !isMP4) {
      return `File type not supported. Please upload an MP4 file.`;
    }
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size must be less than ${maxSizeMB}MB`;
    }
    return null;
  }, [allowedTypes, maxSizeMB]);

  return (
    <StageCard
      title={cardTitle}
      icon={cardIcon}
      showReset={actualUploadState === 'uploaded'}
      resetTitle={resetTitle}
      onResetClick={onReset}
      resetting={resetting}
      className={className}
    >
      {/* Content Area */}
      <div className="p-6 flex-1">
        <div className="aspect-video rounded-lg flex items-center justify-center overflow-hidden border" style={{ background: '#fdfcfb', borderColor: '#e8e6e3' }}>
          {actualUploadState === 'uploaded' && actualUploadedFile?.url ? (
            <video
              src={actualUploadedFile.url}
              className="w-full h-full object-contain rounded-lg"
              controls
            />
          ) : (
            <div className="flex flex-col items-center justify-center space-y-3 opacity-40">
              <Video className="w-12 h-12" style={{ color: '#9ca3af' }} />
              <p className="text-sm font-medium" style={{ color: '#9ca3af' }}>
                Video Preview
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pb-6 flex-shrink-0">
        {/* Upload State */}
        {actualUploadState === 'initial' && (
          <div className="space-y-6">
            <DragAndDrop
              accept={accept}
              onFileSelect={onFileSelect}
              loading={loading}
              buttonText={buttonText}
              dragText={dragText}
              sizeText={sizeText}
              validateFile={validateFile}
            />
          </div>
        )}

        {/* Uploaded State - File Info */}
        {actualUploadState === 'uploaded' && actualUploadedFile && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-1" style={{ color: '#111827' }}>
                {actualUploadedFile.name}
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <FileInfoCard
                icon={Monitor}
                iconColor="#22c55e"
                backgroundColor="#f0fdf4"
                label="Resolution"
                value={actualUploadedFile.width && actualUploadedFile.height ? `${actualUploadedFile.width}×${actualUploadedFile.height}` : '--'}
              />
              <FileInfoCard
                icon={HardDrive}
                iconColor="#7c3aed"
                backgroundColor="#faf5ff"
                label="Size"
                value={actualUploadedFile.size ? `${(actualUploadedFile.size / (1024 * 1024)).toFixed(1)} MB` : '--'}
              />
              <FileInfoCard
                icon={Clock}
                iconColor="#2563eb"
                backgroundColor="#dbeafe"
                label="Length"
                value={actualUploadedFile.duration ?
                  `${Math.floor(actualUploadedFile.duration / 60)}:${Math.floor(actualUploadedFile.duration % 60).toString().padStart(2, '0')}` :
                  '--:--'}
              />
            </div>
          </div>
        )}

        {/* Error State */}
        {actualUploadState === 'error' && (
          <div className="space-y-4">
            <ErrorAlert title="Upload Failed" message={actualError} />
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
        <StateLoader message="Uploading video..." progress={null} />
      )}
    </StageCard>
  );
};
