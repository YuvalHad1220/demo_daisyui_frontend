import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronUp, BarChart2, Hash } from 'lucide-react';

interface DecodingAdvancedDetailsProps {
  ssim: number;
  frameCount: number;
}

const DecodingAdvancedDetails: React.FC<DecodingAdvancedDetailsProps> = ({
  ssim, frameCount
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="w-full">
      <button
        className="flex items-center space-x-2 text-sm font-medium px-3 py-2 rounded-lg border transition-colors hover:bg-gray-50"
        style={{ color: '#14b8a6', borderColor: '#d1d5db' }}
        onClick={() => setShowAdvanced(v => !v)}
      >
        <FileText className="w-4 h-4" style={{ color: '#14b8a6' }} />
        <span>Advanced Details</span>
        {showAdvanced ? <ChevronUp className="w-4 h-4" style={{ color: '#14b8a6' }} /> : <ChevronDown className="w-4 h-4" style={{ color: '#14b8a6' }} />}
      </button>
      {showAdvanced && (
        <div className="mt-2 grid grid-cols-2 gap-4 animate-fade-in p-2">
          <div className="flex flex-col items-center p-3 rounded-lg border" style={{ background: '#fdfcfb', borderColor: '#e8e6e3' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-1" style={{ backgroundColor: '#f3f4f6' }}>
              <BarChart2 className="w-4 h-4" style={{ color: '#6b7280' }} />
            </div>
            <span className="text-xs font-medium mb-1" style={{ color: '#6b7280' }}>SSIM</span>
            <span className="text-sm font-semibold" style={{ color: '#111827' }}>{ssim}</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-lg border" style={{ background: '#fdfcfb', borderColor: '#e8e6e3' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-1" style={{ backgroundColor: '#f3f4f6' }}>
              <Hash className="w-4 h-4" style={{ color: '#6b7280' }} />
            </div>
            <span className="text-xs font-medium mb-1" style={{ color: '#6b7280' }}>Frame Count</span>
            <span className="text-sm font-semibold" style={{ color: '#111827' }}>{frameCount}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DecodingAdvancedDetails;
