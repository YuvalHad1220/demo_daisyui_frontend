import React, { useCallback } from 'react';
import { FileUpload } from '../components/ui/FileUpload';
import { useWorkflow } from '../hooks/useWorkflow';
import { UploadedFile } from '../hooks/useFileUpload';

const Step1FileUpload: React.FC = () => {
  const { fileUpload } = useWorkflow();

  const handleFileComplete = useCallback(async (file: UploadedFile) => {
    try {
      await fileUpload.setUploadedFile(file);
      await fileUpload.setUploadState('uploaded');
      
      // Create a temporary video element to get metadata
      const video = document.createElement('video');
      video.src = file.url || '';
      video.onloadedmetadata = async () => {
        try {
          await fileUpload.updateVideoMetadata(video.duration, video.videoWidth, video.videoHeight);
        } catch (error) {
          console.error('Failed to update video metadata:', error);
        }
      };
    } catch (error) {
      console.error('Failed to complete file upload:', error);
      // Optionally show error to user
      try {
        await fileUpload.setError('Failed to save file information');
        await fileUpload.setUploadState('error');
      } catch (errorSettingError) {
        console.error('Failed to set error state:', errorSettingError);
      }
    }
  }, [fileUpload]);

  const handleUploadStart = useCallback(async () => {
    try {
      await fileUpload.setUploadState('uploading');
      await fileUpload.setUploadProgress(0);
    } catch (error) {
      console.error('Failed to start upload:', error);
    }
  }, [fileUpload]);

  const handleUploadError = useCallback(async (error: string) => {
    try {
      await fileUpload.setError(error);
      await fileUpload.setUploadState('error');
    } catch (errorSettingError) {
      console.error('Failed to set error state:', errorSettingError);
    }
  }, [fileUpload]);

  const handleReset = useCallback(async () => {
    try {
      await fileUpload.resetUpload();
    } catch (error) {
      console.error('Failed to reset upload:', error);
    }
  }, [fileUpload]);

  const handleProgressUpdate = useCallback(async (progress: number) => {
    try {
      await fileUpload.setUploadProgress(progress);
    } catch (error) {
      console.error('Failed to update progress:', error);
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

  return (
    <FileUpload
      accept="video/*"
      maxSizeMB={20}
      allowedTypes={['video/mp4', 'video/x-msvideo', 'video/quicktime', 'video/x-matroska']}
      customValidation={videoValidation}
      title={fileUpload.uploadedFile ? fileUpload.uploadedFile.name : 'Video Upload'}
      buttonText="Upload Video"
      dragText="Drag and drop or click to select"
      sizeText="Supports MP4, MKV • Maximum 20MB"
      onUploadStart={handleUploadStart}
      onUploadComplete={handleFileComplete}
      onUploadError={handleUploadError}
      onReset={handleReset}
      onProgressUpdate={handleProgressUpdate}
      uploadDuration={1500}
      videoFile={fileUpload.uploadedFile}
      // Pass the current state to FileUpload
      currentUploadState={fileUpload.uploadState}
      currentUploadProgress={fileUpload.uploadProgress}
      currentError={fileUpload.error}
      isLoading={fileUpload.isLoading}
    />
  );
};

export default Step1FileUpload; 