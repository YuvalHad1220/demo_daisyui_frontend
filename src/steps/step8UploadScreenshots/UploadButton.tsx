import React from 'react';
import { Upload } from 'lucide-react';
import { AppButton } from '../../components/ui/AppButton';

interface UploadButtonProps {
  onClick: () => void;
  uploading: boolean;
  disabled: boolean;
}

const UploadButton: React.FC<UploadButtonProps> = ({ onClick, uploading, disabled }) => (
  <div className="flex flex-col items-center space-y-4">
    <AppButton
      icon={<Upload className="w-5 h-5" />}
      onClick={onClick}
      disabled={disabled}
      className="w-full max-w-md"
    >
      {uploading ? 'Uploading...' : 'Upload & Search'}
    </AppButton>
    
    {!uploading && !disabled && (
      <p className="text-sm" style={{ color: '#6b7280' }}>
        Click to upload your screenshots and search the video.
      </p>
    )}
  </div>
);

export default UploadButton;
