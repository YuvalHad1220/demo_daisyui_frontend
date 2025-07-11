import React from 'react';
import { X } from 'lucide-react';

interface ScreenshotFile extends File {
  // You can extend with custom fields if needed
}

interface SelectedFilesGridProps {
  selectedFiles: ScreenshotFile[];
  handleRemoveFile: (index: number) => void;
  setHoveredFile: (file: { file: ScreenshotFile; idx: number } | null) => void;
  hoveredFile: { file: ScreenshotFile; idx: number } | null;
}

const SelectedFilesGrid: React.FC<SelectedFilesGridProps> = ({
  selectedFiles,
  handleRemoveFile,
  setHoveredFile,
  hoveredFile
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {selectedFiles.map((file, index) => (
          <div
            key={`${file.name}-${index}`}
            className="relative group rounded-lg overflow-hidden border transition-all duration-200 hover:shadow-md"
            style={{ borderColor: '#e5e7eb', backgroundColor: '#ffffff' }}
            onMouseEnter={() => setHoveredFile({ file, idx: index })}
            onMouseLeave={() => setHoveredFile(null)}
          >
            <div className="aspect-square bg-gray-100 flex items-center justify-center">
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="p-3">
              <p className="text-sm font-medium truncate" style={{ color: '#111827' }}>
                {file.name}
              </p>
              <p className="text-xs" style={{ color: '#6b7280' }}>
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            
            <button
              onClick={() => handleRemoveFile(index)}
              className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              style={{ backgroundColor: '#ef4444', color: '#ffffff' }}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectedFilesGrid;
