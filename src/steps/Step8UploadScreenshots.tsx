import React from 'react';
import UploadScreenshotsWrapper from './step8UploadScreenshots/UploadScreenshotsWrapper';

interface Step8UploadScreenshotsProps {
  onResetGroup: () => void;
}

const Step8UploadScreenshots: React.FC<Step8UploadScreenshotsProps> = ({ onResetGroup }) => {
  return <UploadScreenshotsWrapper onResetGroup={onResetGroup} />;
};

export default Step8UploadScreenshots;
