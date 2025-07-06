import React, { useCallback, useState } from 'react';
import { UploadVideo } from '../components/ui/UploadVideo';
import { useWorkflow } from '../hooks/useWorkflow';

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

  const handleReset = useCallback(async () => {
    setResetting(true);
    await fileUpload.reset();
    setResetting(false);
  }, [fileUpload]);

  return (
    <UploadVideo
      accept="video/*"
      maxSizeMB={20}
      allowedTypes={['video/mp4']}
      title={fileUpload.uploadedFile ? fileUpload.uploadedFile.name : 'Video Upload'}
      sizeText="Supports MP4 • Maximum 20MB"
      videoFile={fileUpload.uploadedFile}
      currentUploadState={fileUpload.uploadState}
      currentError={fileUpload.error}
      onFileSelect={handleFileUpload}
      onReset={handleReset}
      resetting={resetting}
    />
  );
};

export default Step1FileUpload;