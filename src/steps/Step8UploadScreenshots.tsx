import React from 'react';

const Step8UploadScreenshots: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Screenshots</h3>
      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <div className="text-gray-500 mb-2">
            <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-sm text-gray-600">Drop screenshot files here or click to browse</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <h4 className="font-medium text-orange-900 mb-2">Uploaded Files</h4>
          <div className="text-sm text-orange-700 space-y-1">
            <div>• screenshot_1.png (2.1 MB)</div>
            <div>• screenshot_2.png (1.8 MB)</div>
            <div>• screenshot_3.png (2.3 MB)</div>
            <div>• screenshot_4.png (1.9 MB)</div>
          </div>
          <div className="text-xs text-orange-600 mt-2">Total: 4 files, 8.1 MB</div>
        </div>
      </div>
    </div>
  );
};

export default Step8UploadScreenshots; 