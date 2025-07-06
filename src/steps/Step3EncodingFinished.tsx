import React from 'react';

const Step3EncodingFinished: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Encoding Finished</h3>
      <div className="space-y-4">
        <div className="flex items-center space-x-3 text-green-600">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">Encoding completed successfully!</span>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-2">Compression Results</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-green-700 font-medium">Compression Rate</div>
              <div className="text-green-600">40%</div>
            </div>
            <div>
              <div className="text-green-700 font-medium">Space Saved</div>
              <div className="text-green-600">8.26 MB</div>
            </div>
            <div>
              <div className="text-green-700 font-medium">Processing Time</div>
              <div className="text-green-600">4.6 seconds</div>
            </div>
            <div>
              <div className="text-green-700 font-medium">Final Size</div>
              <div className="text-green-600">20.04 MB</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step3EncodingFinished; 