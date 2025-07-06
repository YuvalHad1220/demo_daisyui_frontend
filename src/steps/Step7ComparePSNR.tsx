import React from 'react';

const Step7ComparePSNR: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Compare PSNR</h3>
      <div className="space-y-4">
        <div className="bg-purple-50 rounded-lg p-4">
          <h4 className="font-medium text-purple-900 mb-2">PSNR Analysis</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-purple-700">Original vs Compressed</span>
              <span className="text-sm font-medium text-purple-900">38.2 dB</span>
            </div>
            <div className="w-full bg-purple-200 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: '76%' }}></div>
            </div>
            <div className="text-xs text-purple-600">Excellent quality (30+ dB)</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-gray-700 font-medium">Frame Analysis</div>
            <div className="text-gray-600">1800 frames processed</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-gray-700 font-medium">Processing Time</div>
            <div className="text-gray-600">60 seconds</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step7ComparePSNR; 