import React from 'react';

const Step10ShowTimestamps: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Show Timestamps</h3>
      <div className="space-y-4">
        <div className="bg-indigo-50 rounded-lg p-4">
          <h4 className="font-medium text-indigo-900 mb-2">Timestamp Analysis</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-indigo-700">Processed Images</span>
              <span className="text-indigo-900 font-medium">3 images</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-indigo-700">Total Processing Time</span>
              <span className="text-indigo-900 font-medium">2.12 seconds</span>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Timestamps</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <div>• 00:15 - screenshot_1.png</div>
            <div>• 00:45 - screenshot_2.png</div>
            <div>• 01:15 - screenshot_3.png</div>
          </div>
        </div>
        <div className="flex items-center space-x-3 text-green-600">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium">All timestamps extracted successfully</span>
        </div>
      </div>
    </div>
  );
};

export default Step10ShowTimestamps; 