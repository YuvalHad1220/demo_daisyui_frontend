import React from 'react';

const Step2EncodingStarted: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Encoding Started</h3>
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500"></div>
          <span className="text-gray-700">Processing video...</span>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Encoding Progress</h4>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-teal-500 h-2 rounded-full" style={{ width: '45%' }}></div>
          </div>
          <div className="text-sm text-gray-600 mt-2">45% complete</div>
        </div>
        <div className="text-sm text-gray-600">
          <div>Estimated time remaining: 2.5 seconds</div>
          <div>Current frame: 810 / 1800</div>
        </div>
      </div>
    </div>
  );
};

export default Step2EncodingStarted; 