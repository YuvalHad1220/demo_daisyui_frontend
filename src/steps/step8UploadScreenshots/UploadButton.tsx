import React from 'react';
import { Upload } from 'lucide-react';

interface UploadButtonProps {
  onClick: () => void;
  uploading: boolean;
  disabled: boolean;
}

const UploadButton: React.FC<UploadButtonProps> = ({
  onClick, uploading, disabled
}) => (
  <button
    onClick={onClick}
    className="w-full mt-auto px-6 py-3 rounded-lg font-semibold text-white flex items-center justify-center space-x-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
    style={{ background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)', boxShadow: '0 4px 6px -1px rgba(20,184,166,0.1)' }}
    disabled={disabled}
  >
    <Upload className="w-5 h-5" />
    <span>{uploading ? 'Uploading...' : 'Upload screenshots'}</span>
  </button>
);

export default UploadButton;
