import React, { useState, useCallback } from 'react';
import { FileUpload, UploadedFile } from '../components/ui/FileUpload';
import { VideoPlayer } from '../components/ui/VideoPlayer';
import { FileInfo, FileInfoItem } from '../components/ui/FileInfo';

interface VideoFile extends UploadedFile {
  duration?: number;
  width?: number;
  height?: number;
}

const Step1FileUpload: React.FC = () => {
  const [videoFile, setVideoFile] = useState<VideoFile | null>(null);

  const handleVideoLoad = useCallback((video: HTMLVideoElement) => {
    if (videoFile) {
      setVideoFile(prev => prev ? {
        ...prev,
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight
      } : null);
    }
  }, [videoFile]);

  const handleFileComplete = useCallback((file: UploadedFile) => {
    setVideoFile(file as VideoFile);
  }, []);

  const formatDuration = (seconds: number | null | undefined) => {
    if (!seconds) return '--:--';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getResolutionText = (width?: number, height?: number) => {
    if (!width || !height) return '--';
    
    // Determine resolution label
    if (width >= 3840 && height >= 2160) return `${width}×${height} (4K)`;
    if (width >= 1920 && height >= 1080) return `${width}×${height} (FHD)`;
    if (width >= 1280 && height >= 720) return `${width}×${height} (HD)`;
    return `${width}×${height}`;
  };

  const getFileInfoItems = (): FileInfoItem[] => {
    if (!videoFile) return [];

    return [
      {
        label: 'Resolution',
        value: getResolutionText(videoFile.width, videoFile.height)
      },
      {
        label: 'Size',
        value: `${(videoFile.size / (1024 * 1024)).toFixed(1)} MB`
      },
      {
        label: 'Length',
        value: formatDuration(videoFile.duration)
      }
    ];
  };

  const videoValidation = useCallback((file: File): string | null => {
    const allowedTypes = ['video/mp4', 'video/x-msvideo', 'video/quicktime', 'video/x-matroska'];
    if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.mkv')) {
      return 'Please select a supported video file (MP4, MKV)';
    }
    if (file.size > 20 * 1024 * 1024) {
      return 'File size must be less than 20MB';
    }
    return null;
  }, []);

  return (
    <FileUpload
      accept="video/*"
      maxSizeMB={20}
      allowedTypes={['video/mp4', 'video/x-msvideo', 'video/quicktime', 'video/x-matroska']}
      customValidation={videoValidation}
      title={videoFile ? videoFile.name : 'Video Upload'}
      buttonText="Upload Video"
      dragText="Drag and drop or click to select"
      sizeText="Supports MP4, MKV • Maximum 20MB"
      onUploadComplete={handleFileComplete}
      uploadDuration={1500}
    >
      {/* Group video and cards together, compact spacing */}
      {videoFile && (
        <div className="flex flex-col items-center gap-4 w-full max-w-2xl mx-auto mt-2 mb-2">
          <div className="w-full">
            <VideoPlayer
              src={videoFile.url || ''}
              onLoad={handleVideoLoad}
              controls
              className="w-full rounded-lg shadow"
            />
          </div>
          <FileInfo
            items={getFileInfoItems()}
            layout="cards"
            columns={3}
            className="w-full"
          />
        </div>
      )}
    </FileUpload>
  );
};

export default Step1FileUpload; 