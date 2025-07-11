import React from 'react';
import { Upload } from 'lucide-react';

interface UploadAreaProps {
  selectedFilesCount: number;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

const UploadArea: React.FC<UploadAreaProps> = ({
  selectedFilesCount,
  onDrop,
  onFileSelect,
  fileInputRef
}) => {
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="flex flex-col items-center space-y-6 animate-fade-in">
      <div
        className="w-full max-w-md border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors hover:border-orange-400"
        style={{ borderColor: '#d1d5db', backgroundColor: '#fdfcfb' }}
        onDrop={onDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-12 h-12 mx-auto" style={{ color: '#9ca3af' }} />
        <p className="text-lg font-medium" style={{ color: '#111827' }}>
          Upload Screenshots
        </p>
        <p className="text-sm mt-2" style={{ color: '#6b7280' }}>
          Drag and drop image files here, or click to browse
        </p>
        <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>
          Supports JPG, PNG, GIF • Maximum 10MB per file
        </p>
      </div>
      
      {selectedFilesCount > 0 && (
        <p className="text-sm font-medium" style={{ color: '#6b7280' }}>
          {selectedFilesCount} file{selectedFilesCount !== 1 ? 's' : ''} selected
        </p>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={onFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default UploadArea;
