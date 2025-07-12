import React, { useCallback, useState } from 'react';
import { FileUpload } from '../components/ui/FileUpload';
import { useWorkflow } from '../hooks/useWorkflow';

interface Step1FileUploadProps {
  onResetGroup: () => void;
  isFirstStepInGroup: boolean;
}

const Step1FileUpload: React.FC<Step1FileUploadProps> = ({ onResetGroup }) => {
  const { fileUpload } = useWorkflow();
  const [resetting, setResetting] = useState(false);

  const handleFileUpload = useCallback(async (file: File) => {
    await fileUpload.uploadFile(file);
    if (file.type.startsWith('video/')) {
      const video = document.createElement('video');
      video.src = URL.createObjectURL(file);
      video.onloadedmetadata = () => {
        fileUpload.updateVideoMetadata(video.duration, video.videoWidth, video.videoHeight);
      };
    }
  }, [fileUpload]);

  const handleReset = useCallback(async () => {
    setResetting(true);
    await fileUpload.reset();
    onResetGroup(); // Call the resetGroup function passed from MainContent
    setResetting(false);
  }, [fileUpload, onResetGroup]);

  return (
    <FileUpload
      accept="video/*"
      maxSizeMB={50}
      allowedTypes={['video/mp4']}
      title={fileUpload.uploadedFile ? fileUpload.uploadedFile.name : 'Video Upload'}
      sizeText="Supports MP4 • Maximum 50MB"
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
