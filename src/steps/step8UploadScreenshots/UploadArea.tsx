import React from 'react';
import { Image } from 'lucide-react';

interface UploadAreaProps {
  selectedFilesCount: number;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

const UploadArea: React.FC<UploadAreaProps> = ({
  selectedFilesCount,
  onDrop,
  onFileSelect,
  fileInputRef,
}) => (
  <div
    className={`border-2 border-dashed rounded-lg transition-all duration-300 cursor-pointer hover:border-gray-400 ${
      selectedFilesCount > 0 
        ? 'p-4 mb-6' 
        : 'p-12 text-center'
    }`}
    style={{ 
      borderColor: '#e8e6e3', 
      background: selectedFilesCount > 0 ? '#fdfcfb' : 'transparent'
    }}
    onDragOver={(e) => e.preventDefault()}
    onDrop={onDrop}
    onClick={() => fileInputRef.current?.click()}
  >
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      multiple
      className="hidden"
      onChange={onFileSelect}
    />
    <div className={`flex items-center ${selectedFilesCount > 0 ? 'justify-center space-x-3' : 'flex-col space-y-4'}`}>
      <div className={`rounded-lg flex items-center justify-center ${selectedFilesCount > 0 ? 'w-8 h-8' : 'w-12 h-12'}`} style={{ backgroundColor: '#f0fdfa' }}>
        <Image className={selectedFilesCount > 0 ? 'w-4 h-4' : 'w-6 h-6'} style={{ color: '#14b8a6' }} />
      </div>
      <div className={`text-center ${selectedFilesCount > 0 ? 'text-sm' : ''}`}>
        <p className={`font-medium ${selectedFilesCount > 0 ? 'text-sm' : 'text-base'}`} style={{ color: '#374151' }}>
          {selectedFilesCount > 0 ? 'Add more images' : 'Drag and drop or click to select'}
        </p>
        <p className="text-xs" style={{ color: '#6b7280' }}>
          Supports PNG, JPG, JPEG
        </p>
      </div>
    </div>
  </div>
);

export default UploadArea;
