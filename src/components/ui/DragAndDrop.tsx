import React, { useRef, useCallback } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import { Upload } from 'lucide-react';

export interface DragAndDropProps {
  accept?: string;
  onFileSelect: (file: File) => void;
  loading?: boolean;
  buttonText?: string;
  dragText?: string;
  sizeText?: string;
  validateFile?: (file: File) => string | null;
}

export const DragAndDrop: React.FC<DragAndDropProps> = ({
  accept = "*/*",
  onFileSelect,
  loading = false,
  buttonText = "Upload File",
  dragText = "Drag and drop or click to select",
  sizeText,
  validateFile
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && !loading) {
      if (validateFile) {
        const validationError = validateFile(file);
        if (!validationError) {
          onFileSelect(file);
        }
      } else {
        onFileSelect(file);
      }
    }
  }, [onFileSelect, validateFile, loading]);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && !loading) {
      if (validateFile) {
        const validationError = validateFile(file);
        if (!validationError) {
          onFileSelect(file);
        }
      } else {
        onFileSelect(file);
      }
    }
  }, [onFileSelect, validateFile, loading]);

  return (
    <div
      className="border-2 border-dashed rounded-lg p-4 text-center transition-all duration-200 cursor-pointer hover:border-gray-400 hover:bg-gray-50"
      style={{ borderColor: '#d1d5db' }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={() => !loading && fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileSelect}
        disabled={loading}
      />
      <div className="flex flex-col items-center space-y-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: '#f0fdfa' }}
        >
          <Upload className="w-6 h-6" style={{ color: '#14b8a6' }} />
        </div>
        <button
          className="px-8 py-3 rounded-lg font-semibold text-lg text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
            boxShadow: '0 4px 6px -1px rgba(20, 184, 166, 0.1)'
          }}
          disabled={loading}
        >
          {buttonText}
        </button>
        <div className="space-y-1">
          <p className="text-sm font-medium" style={{ color: '#374151' }}>
            {dragText}
          </p>
          {sizeText && (
            <p className="text-xs" style={{ color: '#6b7280' }}>
              {sizeText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
