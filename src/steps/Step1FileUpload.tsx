import React from 'react';
import FileUploadWrapper from './step1FileUpload/FileUploadWrapper';

interface Step1FileUploadProps {
  onResetGroup: () => void;
  isFirstStepInGroup: boolean;
}

const Step1FileUpload: React.FC<Step1FileUploadProps> = ({ onResetGroup, isFirstStepInGroup }) => {
  return <FileUploadWrapper onResetGroup={onResetGroup} isFirstStepInGroup={isFirstStepInGroup} />;
};

export default Step1FileUpload;