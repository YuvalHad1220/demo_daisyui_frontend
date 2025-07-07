import React from 'react';
import { Camera } from 'lucide-react';
import { AppButton } from '../../components/ui/AppButton';

interface ScreenshotButtonProps {
  onClick: () => void;
  disabled: boolean;
}

const ScreenshotButton: React.FC<ScreenshotButtonProps> = ({ onClick, disabled }) => (
  <AppButton
    icon={<Camera className="w-5 h-5" />}
    onClick={onClick}
    className="mb-2"
    disabled={disabled}
  >
    Take Screenshot
  </AppButton>
);

export default ScreenshotButton;
