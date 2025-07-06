import React from 'react';

const Step5DecodedVideo: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Decoded Video</h3>
      <div className="space-y-4">
        <div className="bg-gray-100 rounded-lg p-4 text-center">
          <div className="text-gray-500 mb-2">
            <svg className="mx-auto h-16 w-16" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-sm text-gray-600">Video preview</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Decoded Video Info</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <div>Resolution: 1920x1080</div>
            <div>Duration: 90 seconds</div>
            <div>Frame rate: 30 fps</div>
            <div>Codec: H.264</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step5DecodedVideo; 