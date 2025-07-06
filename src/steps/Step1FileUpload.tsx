import React, { useCallback, useState } from 'react';
import { FileUpload } from '../components/ui/FileUpload';
import { useWorkflow } from '../hooks/useWorkflow';
import type { UploadedFile } from '../hooks/useFileUpload';

const Step1FileUpload: React.FC = () => {
  const { fileUpload } = useWorkflow();
  const [resetting, setResetting] = useState(false);

  // All hooks must be called before any return!
  const handleFileUpload = useCallback(async (file: File) => {
    await fileUpload.uploadFile(file);
    // After upload, extract video metadata if video
    if (file.type.startsWith('video/')) {
      const video = document.createElement('video');
      video.src = URL.createObjectURL(file);
      video.onloadedmetadata = async () => {
        await fileUpload.updateVideoMetadata(video.duration, video.videoWidth, video.videoHeight);
      };
    }
  }, [fileUpload]);

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

  const handleReset = useCallback(async () => {
    setResetting(true);
    await fileUpload.reset();
    setResetting(false);
  }, [fileUpload]);

  return (
    <FileUpload
      accept="video/*"
      maxSizeMB={20}
      allowedTypes={['video/mp4']}
      customValidation={videoValidation}
      title={fileUpload.uploadedFile ? fileUpload.uploadedFile.name : 'Video Upload'}
      buttonText="Upload Video"
      dragText="Drag and drop or click to select"
      sizeText="Supports MP4, MKV • Maximum 20MB"
      uploadDuration={1500}
      videoFile={fileUpload.uploadedFile}
      currentUploadState={fileUpload.uploadState}
      currentUploadProgress={fileUpload.uploadProgress}
      currentError={fileUpload.error}
      onFileSelect={handleFileUpload}
      onReset={handleReset}
      resetting={resetting}
    />
  );
};

export default Step1FileUpload; 