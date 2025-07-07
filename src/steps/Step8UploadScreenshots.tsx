import React, { useRef, useState } from 'react';
import { Upload, Image, AlertCircle, X, Loader } from 'lucide-react';
import { StageCard } from '../components/ui/StageCard';
import { Tooltip } from '../components/ui/Tooltip';
import { AppButton } from '../components/ui/AppButton';
import { ProgressBar } from '../components/ui/ProgressBar';
import LoadingCircular from '../components/ui/LoadingCircular';
import { useScreenshotSearch } from '../hooks/useScreenshotSearch';

interface ScreenshotFile extends File {
  // You can extend with custom fields if needed
}

const Step8UploadScreenshots = () => {
  const [selectedFiles, setSelectedFiles] = useState<ScreenshotFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [hoveredFile, setHoveredFile] = useState<{ file: ScreenshotFile; idx: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadDone, setUploadDone] = useState(false);

  // Use the screenshot search hook
  const { startSearch, searchState, searchError, searchProgress } = useScreenshotSearch();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as ScreenshotFile[];
    const validFiles = files.filter((file) => file.type.startsWith('image/'));
    if (validFiles.length !== files.length) {
      setError('Only image files are supported.');
    } else {
      setError('');
    }
    setSelectedFiles((prev) => [...prev, ...validFiles]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files) as ScreenshotFile[];
    const validFiles = files.filter((file) => file.type.startsWith('image/'));
    if (validFiles.length !== files.length) {
      setError('Only image files are supported.');
    } else {
      setError('');
    }
    setSelectedFiles((prev) => [...prev, ...validFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClear = () => {
    setSelectedFiles([]);
    setError('');
    setProgress(0);
  };

  const handleUpload = async () => {
    setUploading(true);
    setError('');
    try {
      await startSearch(selectedFiles);
      setUploadDone(true);
    } catch (err: any) {
      setError(err.message || 'Failed to start image processing.');
    } finally {
      setUploading(false);
    }
  };

  // Show search progress if search is active
  const isSearching = searchState === 'searching';
  const showSearchProgress = isSearching && uploadDone;

  return (
    <StageCard
      title="Upload Screenshots"
      icon={Upload}
      showReset={selectedFiles.length > 0 && !uploading && !uploadDone}
      resetTitle="Clear Selection"
      onResetClick={handleClear}
    >
      <div className="px-6 py-8 flex-1 flex flex-col">
        {/* Upload Area */}
        {!(uploading || uploadDone) && (
          <div
            className={`border-2 border-dashed rounded-lg transition-all duration-300 cursor-pointer hover:border-gray-400 ${
              selectedFiles.length > 0 
                ? 'p-4 mb-6' 
                : 'p-12 text-center'
            }`}
            style={{ 
              borderColor: '#e8e6e3', 
              background: selectedFiles.length > 0 ? '#fdfcfb' : 'transparent'
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
            <div className={`flex items-center ${selectedFiles.length > 0 ? 'justify-center space-x-3' : 'flex-col space-y-4'}`}>
              <div className={`rounded-lg flex items-center justify-center ${selectedFiles.length > 0 ? 'w-8 h-8' : 'w-12 h-12'}`} style={{ backgroundColor: '#f0fdfa' }}>
                <Image className={selectedFiles.length > 0 ? 'w-4 h-4' : 'w-6 h-6'} style={{ color: '#14b8a6' }} />
              </div>
              <div className={`text-center ${selectedFiles.length > 0 ? 'text-sm' : ''}`}>
                <p className={`font-medium ${selectedFiles.length > 0 ? 'text-sm' : 'text-base'}`} style={{ color: '#374151' }}>
                  {selectedFiles.length > 0 ? 'Add more images' : 'Drag and drop or click to select'}
                </p>
                <p className="text-xs" style={{ color: '#6b7280' }}>
                  Supports PNG, JPG, JPEG
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Selected Files Grid */}
        {selectedFiles.length > 0 && !(uploading || uploadDone) && (
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
        )}

        {/* Error */}
        {(error || searchError) && !uploadDone && (
          <div className="flex items-center space-x-2 mb-4 p-3 rounded-lg border" style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
            <AlertCircle className="w-4 h-4" style={{ color: '#ef4444' }} />
            <span className="text-sm font-medium" style={{ color: '#991b1b' }}>{error || searchError}</span>
          </div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div className="mb-4">
            <div className="w-full rounded-full h-3" style={{ background: '#fdfcfb' }}>
              <div
                className="h-3 rounded-full transition-all duration-300"
                style={{ background: 'linear-gradient(90deg, #f59e42 0%, #f97316 100%)', width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <Loader className="w-5 h-5 animate-spin" style={{ color: '#f59e42' }} />
              <p className="text-sm font-medium" style={{ color: '#6b7280' }}>{Math.round(progress)}% uploaded</p>
            </div>
          </div>
        )}

        {/* Search Progress */}
        {showSearchProgress && (
          <div className="mb-4">
            <div className="w-full rounded-full h-3" style={{ background: '#fdfcfb' }}>
              <div
                className="h-3 rounded-full transition-all duration-300"
                style={{ background: 'linear-gradient(90deg, #14b8a6 0%, #0d9488 100%)', width: `${searchProgress.progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-2">
                <Loader className="w-5 h-5 animate-spin" style={{ color: '#14b8a6' }} />
                <p className="text-sm font-medium" style={{ color: '#6b7280' }}>
                  {searchProgress.processingMethod}
                </p>
              </div>
              <p className="text-sm font-medium" style={{ color: '#6b7280' }}>
                {Math.round(searchProgress.progress)}% • {searchProgress.eta}
              </p>
            </div>
            <p className="text-xs mt-1" style={{ color: '#6b7280' }}>
              Found {searchProgress.matchesFound} matches • Frame {searchProgress.currentFrame}/{searchProgress.totalFrames}
            </p>
          </div>
        )}

        {/* Upload Finished State */}
        {uploadDone && !uploading && !isSearching && (
          <div className="flex flex-col items-center space-y-4 animate-fade-in">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f0fdf4' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#f0fdf4" />
                <path d="M7 13l3 3 7-7" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-lg font-semibold" style={{ color: '#22c55e' }}>
              Upload Complete!
            </p>
            <p className="text-sm" style={{ color: '#6b7280' }}>
              Your screenshots have been successfully uploaded and are ready for processing.
            </p>
          </div>
        )}

        {/* Upload Button */}
        {!uploadDone && (
          <button
            onClick={handleUpload}
            className="w-full mt-auto px-6 py-3 rounded-lg font-semibold text-white flex items-center justify-center space-x-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)', boxShadow: '0 4px 6px -1px rgba(20,184,166,0.1)' }}
            disabled={selectedFiles.length === 0 || uploading}
          >
            <Upload className="w-5 h-5" />
            <span>{uploading ? 'Uploading...' : 'Upload screenshots'}</span>
          </button>
        )}
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </StageCard>
  );
};

export default Step8UploadScreenshots;