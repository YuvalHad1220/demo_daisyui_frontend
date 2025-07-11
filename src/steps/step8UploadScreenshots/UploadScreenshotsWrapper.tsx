import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { Loader } from 'lucide-react';
import { StageCard } from '../../components/ui/StageCard';
import { useWorkflow } from '../../hooks/WorkflowContext';
import UploadArea from './UploadArea';
import SelectedFilesGrid from './SelectedFilesGrid';
import ErrorDisplay from './ErrorDisplay';
import SearchProgress from './SearchProgress';
import UploadFinishedState from './UploadFinishedState';
import UploadButton from './UploadButton';
import UploadProgress from './UploadProgress';
import LoadingCircular from '../../components/ui/LoadingCircular';

interface ScreenshotFile extends File {}

interface UploadScreenshotsWrapperProps {
  onResetGroup: () => void;
}

const UploadScreenshotsWrapper: React.FC<UploadScreenshotsWrapperProps> = ({ onResetGroup }) => {
  const { screenshotSearch } = useWorkflow();
  const { selectedFiles, setSelectedFiles } = screenshotSearch;
  const [error, setError] = useState('');
  const [hoveredFile, setHoveredFile] = useState<{ file: ScreenshotFile; idx: number } | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isSearchStarted, setIsSearchStarted] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [resetting, setResetting] = useState(false);

  // Use the screenshot search hook from workflow context
  const { startSearch, searchState, searchError, searchProgress, resetSearch, addUploadedImage } = screenshotSearch;
  // Get the workflow context to access file upload info
  const { fileUpload } = useWorkflow();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as ScreenshotFile[];
    const validFiles = files.filter((file) => file.type.startsWith('image/'));
    if (validFiles.length !== files.length) {
      setError('Only image files are supported.');
    } else {
      setError('');
    }
    setSelectedFiles((prev: ScreenshotFile[]) => [...prev, ...validFiles]);
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
    setSelectedFiles((prev: ScreenshotFile[]) => [...prev, ...validFiles]);
  };

  const handleReset = async () => {
    setResetting(true);
    setError('');
    setUploadProgress(0);
    setIsUploading(false);
    setIsSearchStarted(false);
    setShowComplete(false);
    resetSearch();
    await new Promise(res => setTimeout(res, 400));
    onResetGroup();
    setResetting(false);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setError('');
    setIsUploading(true);
    setUploadProgress(0);
    setIsSearchStarted(false);
    setShowComplete(false);
    try {
      // Step 1: Upload all image files to get their paths
      const uploadedPaths: string[] = [];
      let videoPath = '';
      const total = selectedFiles.length;
      for (let i = 0; i < total; i++) {
        const file = selectedFiles[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('key', fileUpload.uploadedFile?.key || '');
        const response = await fetch('http://localhost:9000/upload_vector_image', {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || `Upload failed for ${file.name}`);
        }
        const result = await response.json();
        if (result.result === 'ok') {
          uploadedPaths.push(result.path);
          videoPath = result.video_path;
          const fileUrl = URL.createObjectURL(file);
          addUploadedImage(result.filename, fileUrl);
        }
        setUploadProgress(((i + 1) / total) * 100);
      }
      setIsUploading(false);
      setIsSearchStarted(true);
      // Step 2: Start the vector search
      await startSearch(videoPath, uploadedPaths);
    } catch (e: any) {
      setError(e.message || 'Upload and search failed');
      setIsUploading(false);
      setIsSearchStarted(false);
      setUploadProgress(0);
    }
  };

  // Watch for search completion
  React.useEffect(() => {
    if (isSearchStarted && searchState === 'done') {
      setShowComplete(true);
      setIsSearchStarted(false);
    }
  }, [isSearchStarted, searchState]);

  const showUploadUI = !isUploading && !isSearchStarted && !showComplete;
  const showProgressBars = isUploading || isSearchStarted;

  return (
    <StageCard
      title="Upload Screenshots"
      icon={Upload}
      showReset={selectedFiles.length > 0 && showUploadUI}
      resetTitle="Reset Uploads"
      onResetClick={handleReset}
      resetting={resetting}
    >
      <div className="px-6 py-8 flex-1 flex flex-col rounded-xl min-h-[600px]">
        {showUploadUI && (
          <>
            <UploadArea
              selectedFilesCount={selectedFiles.length}
              onDrop={handleDrop}
              onFileSelect={handleFileSelect}
              fileInputRef={fileInputRef}
            />
            {selectedFiles.length > 0 && (
              <div className="mt-4">
                <SelectedFilesGrid
                  selectedFiles={selectedFiles}
                  handleRemoveFile={(index) => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}
                  setHoveredFile={setHoveredFile}
                  hoveredFile={hoveredFile}
                />
              </div>
            )}
            {(error || searchError) && (
              <div className="mt-6">
                <ErrorDisplay error={error || searchError} />
              </div>
            )}
            <div className="mt-8">
              <UploadButton
                onClick={handleUpload}
                uploading={isUploading || isSearchStarted}
                disabled={selectedFiles.length === 0 || isUploading || isSearchStarted}
              />
            </div>
          </>
        )}
        {showProgressBars && (
        <div className="mt-8 w-full max-w-md mx-auto flex flex-col gap-4 items-center">
          <span className="font-semibold text-xl mb-2" style={{ color: '#111827' }}>Vector Search In Progress</span>
          <LoadingCircular size="md" className="mb-4" />
          <UploadProgress
              progress={isUploading ? uploadProgress : 100}
              waiting={!isUploading && isSearchStarted}
            />
            <SearchProgress
              progress={searchProgress.progress}
              processingMethod={searchProgress.processingMethod}
              eta={searchProgress.eta}
              matchesFound={searchProgress.matchesFound}
              currentFrame={searchProgress.currentFrame}
              totalFrames={searchProgress.totalFrames}
              waiting={isUploading}
            />
          </div>
        )}
        {showComplete && (
          <div className="mt-8">
            <UploadFinishedState />
          </div>
        )}
      </div>
    </StageCard>
  );
};

export default UploadScreenshotsWrapper;
