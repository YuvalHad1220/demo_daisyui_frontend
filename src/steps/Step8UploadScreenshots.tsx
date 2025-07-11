import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { StageCard } from '../components/ui/StageCard';
import { useScreenshotSearch } from '../hooks/useScreenshotSearch';
import { useWorkflow } from '../hooks/WorkflowContext';
import UploadArea from './step8UploadScreenshots/UploadArea';
import SelectedFilesGrid from './step8UploadScreenshots/SelectedFilesGrid';
import ErrorDisplay from './step8UploadScreenshots/ErrorDisplay';
import SearchProgress from './step8UploadScreenshots/SearchProgress';
import UploadFinishedState from './step8UploadScreenshots/UploadFinishedState';
import UploadButton from './step8UploadScreenshots/UploadButton';
import { AppButton } from '../components/ui/AppButton';

interface ScreenshotFile extends File {
  // You can extend with custom fields if needed
}

const Step8UploadScreenshots: React.FC<{ onResetGroup: () => void }> = ({ onResetGroup }) => {
  const [selectedFiles, setSelectedFiles] = useState<ScreenshotFile[]>([]);
  const [error, setError] = useState('');
  const [hoveredFile, setHoveredFile] = useState<{ file: ScreenshotFile; idx: number } | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileUrls, setUploadedFileUrls] = useState<{ [filename: string]: string }>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [resetting, setResetting] = useState(false);

  // Use the screenshot search hook from workflow context
  const { screenshotSearch } = useWorkflow();
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
    setUploadProgress(0);
    setIsUploading(false);
    resetSearch();
    onResetGroup();
  };

  const handleReset = async () => {
    setResetting(true);
    setSelectedFiles([]);
    setError('');
    setUploadProgress(0);
    setIsUploading(false);
    resetSearch();
    await new Promise(res => setTimeout(res, 400)); // for button feedback
    onResetGroup();
    setResetting(false);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setError('');
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Step 1: Upload all image files to get their paths
      const uploadedPaths: string[] = [];
      let videoPath = '';
      const total = selectedFiles.length;

      for (let i = 0; i < total; i++) {
        const file = selectedFiles[i];
        const formData = new FormData();
        formData.append('file', file);

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
          // Get video_path from the response (it's the same for all uploads)
          videoPath = result.video_path;
          
          // Create a data URL for the uploaded file so we can display it later
          const fileUrl = URL.createObjectURL(file);
          addUploadedImage(result.filename, fileUrl);
          
          console.log(`Uploaded image: ${result.filename} -> ${result.path}`);
          console.log(`Video path from upload: ${result.video_path}`);
        }

        // Update progress
        const progress = ((i + 1) / total) * 100;
        setUploadProgress(progress);
      }

      // Step 2: Use the video path from upload response and pass all uploaded image paths
      console.log('Starting vector search with:');
      console.log('- Video path:', videoPath);
      console.log('- Images paths:', uploadedPaths);

      // Step 3: Start the vector search with the correct parameters
      await startSearch(videoPath, uploadedPaths);

    } catch (e: any) {
      setError(e.message || 'Upload and search failed');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const isSearching = searchState === 'searching';
  const isDone = searchState === 'done';
  const showUploadProgress = isUploading && !isSearching;

  return (
    <StageCard
      title="Upload Screenshots"
      icon={Upload}
      showReset={selectedFiles.length > 0 && !isUploading && !isSearching && !isDone}
      resetTitle="Reset Uploads"
      onResetClick={handleReset}
      resetting={resetting}
    >
      <div className="px-6 py-8 flex-1 flex flex-col">
        {!(isUploading || isSearching || isDone) && (
            <UploadArea
              selectedFilesCount={selectedFiles.length}
              onDrop={handleDrop}
              onFileSelect={handleFileSelect}
              fileInputRef={fileInputRef}
            />
        )}

        {selectedFiles.length > 0 && !(isUploading || isSearching || isDone) && (
          <SelectedFilesGrid
            selectedFiles={selectedFiles}
            handleRemoveFile={(index) => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}
            setHoveredFile={setHoveredFile}
            hoveredFile={hoveredFile}
          />
        )}

        {(error || searchError) && !isDone && (
          <ErrorDisplay error={error || searchError} />
        )}

        {showUploadProgress && (
          <div className="mb-4">
            <div className="w-full rounded-full h-3" style={{ background: '#fdfcfb' }}>
              <div
                className="h-3 rounded-full transition-all duration-300"
                style={{ background: 'linear-gradient(90deg, #f59e42 0%, #f97316 100%)', width: `${uploadProgress}%` }}
              />
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <div className="w-5 h-5 animate-spin rounded-full border-2 border-orange-500 border-t-transparent"></div>
              <p className="text-sm font-medium" style={{ color: '#6b7280' }}>
                {Math.round(uploadProgress)}% uploaded • Starting vector search...
              </p>
            </div>
          </div>
        )}

        {isSearching && (
          <SearchProgress
            progress={searchProgress.progress}
            processingMethod={searchProgress.processingMethod}
            eta={searchProgress.eta}
            matchesFound={searchProgress.matchesFound}
            currentFrame={searchProgress.currentFrame}
            totalFrames={searchProgress.totalFrames}
          />
        )}

        {isDone && !isSearching && (
          <UploadFinishedState />
        )}

        {!isDone && (
          <UploadButton
            onClick={handleUpload}
            uploading={isUploading || isSearching}
            disabled={selectedFiles.length === 0 || isUploading || isSearching}
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
