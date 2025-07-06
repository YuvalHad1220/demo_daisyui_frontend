import React from 'react';

const Step9ProcessImages: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Process Images</h3>
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
          <span className="text-gray-700">Processing images...</span>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Processing Progress</h4>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-orange-500 h-2 rounded-full" style={{ width: '75%' }}></div>
          </div>
          <div className="text-sm text-gray-600 mt-2">75% complete (3 of 4 images)</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <h4 className="font-medium text-orange-900 mb-2">Processing Results</h4>
          <div className="text-sm text-orange-700 space-y-1">
            <div>✓ screenshot_1.png - Processed</div>
            <div>✓ screenshot_2.png - Processed</div>
            <div>✓ screenshot_3.png - Processed</div>
            <div>⏳ screenshot_4.png - Processing...</div>
          </div>
          <div className="text-xs text-orange-600 mt-2">Processing time: 2.12 seconds</div>
        </div>
      </div>
    </div>
  );
};

export default Step9ProcessImages; 