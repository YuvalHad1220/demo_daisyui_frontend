import React from 'react';
import { X } from 'lucide-react';
import { Tooltip } from '../../components/ui/Tooltip';

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
  hoveredFile,
}) => (
  <div className="mb-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold" style={{ color: '#111827' }}>
        Selected Images ({selectedFiles.length})
      </h3>
    </div>
    <div className="grid grid-cols-4 gap-3">
      {selectedFiles.map((file, idx) => (
        <div 
          key={idx} 
          className="relative group"
          onMouseEnter={() => setHoveredFile({ file, idx })}
          onMouseLeave={() => setHoveredFile(null)}
        >
          <div className="aspect-square rounded-lg overflow-hidden border" style={{ borderColor: '#e8e6e3' }}>
            <img
              src={URL.createObjectURL(file)}
              alt={file.name}
              className="w-full h-full object-cover"
            />
          </div>
          <Tooltip content="Remove" position="top">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveFile(idx);
              }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
            >
              <X className="w-3 h-3" />
            </button>
          </Tooltip>
          {hoveredFile && hoveredFile.idx === idx && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 z-50">
              <div className="rounded-lg shadow-lg p-4" style={{ background: '#fdfcfb', borderColor: '#e8e6e3', border: '1px solid', minWidth: '240px' }}>
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-full h-40 object-cover rounded mb-3"
                />
                <div className="text-center">
                  <p className="text-sm font-medium mb-1" style={{ color: '#111827' }}>
                    {file.name}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

export default SelectedFilesGrid;
