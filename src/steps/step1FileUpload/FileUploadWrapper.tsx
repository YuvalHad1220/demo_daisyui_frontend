import React, { useCallback, useState } from 'react';
import { FileUpload } from '../../components/ui/FileUpload';
import { useWorkflow } from '../../hooks/WorkflowContext';

const FileUploadWrapper: React.FC = () => {
  const { fileUpload } = useWorkflow();
  const [resetting, setResetting] = useState(false);

  const handleFileUpload = useCallback(async (file: File) => {
    await fileUpload.uploadFile(file);
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
    <FileUpload
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

export default FileUploadWrapper;
