import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { StageCard } from '../components/ui/StageCard';
import { useScreenshotSearch } from '../hooks/useScreenshotSearch';
import UploadArea from './step8UploadScreenshots/UploadArea';
import SelectedFilesGrid from './step8UploadScreenshots/SelectedFilesGrid';
import ErrorDisplay from './step8UploadScreenshots/ErrorDisplay';
import UploadProgress from './step8UploadScreenshots/UploadProgress';
import SearchProgress from './step8UploadScreenshots/SearchProgress';
import UploadFinishedState from './step8UploadScreenshots/UploadFinishedState';
import UploadButton from './step8UploadScreenshots/UploadButton';

interface ScreenshotFile extends File {
  // You can extend with custom fields if needed
}

const Step8UploadScreenshots: React.FC<{ onResetGroup: () => void }> = ({ onResetGroup }) => {
  const [selectedFiles, setSelectedFiles] = useState<ScreenshotFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [hoveredFile, setHoveredFile] = useState<{ file: ScreenshotFile; idx: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadDone, setUploadDone] = useState(false);

  // Use the screenshot search hook
  const { startSearch, searchState, searchError, searchProgress, resetSearch } = useScreenshotSearch();

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

  const handleClear = () => {
    setSelectedFiles([]);
    setError('');
    setProgress(0);
    resetSearch();
    setUploadDone(false);
    onResetGroup();
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
        {!(uploading || uploadDone) && (
          <UploadArea
            selectedFilesCount={selectedFiles.length}
            onDrop={handleDrop}
            onFileSelect={handleFileSelect}
            fileInputRef={fileInputRef}
          />
        )}

        {selectedFiles.length > 0 && !(uploading || uploadDone) && (
          <SelectedFilesGrid
            selectedFiles={selectedFiles}
            handleRemoveFile={handleRemoveFile}
            setHoveredFile={setHoveredFile}
            hoveredFile={hoveredFile}
          />
        )}

        {(error || searchError) && !uploadDone && (
          <ErrorDisplay error={error || searchError} />
        )}

        {uploading && (
          <UploadProgress progress={progress} />
        )}

        {showSearchProgress && (
          <SearchProgress
            progress={searchProgress.progress}
            processingMethod={searchProgress.processingMethod}
            eta={searchProgress.eta}
            matchesFound={searchProgress.matchesFound}
            currentFrame={searchProgress.currentFrame}
            totalFrames={searchProgress.totalFrames}
          />
        )}

        {uploadDone && !uploading && !isSearching && (
          <UploadFinishedState />
        )}

        {!uploadDone && (
          <UploadButton
            onClick={handleUpload}
            uploading={uploading}
            disabled={selectedFiles.length === 0 || uploading}
          />
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