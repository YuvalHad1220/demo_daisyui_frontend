import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronUp, Signal, HardDrive, Monitor, BarChart2 } from 'lucide-react';

interface EncodingAdvancedDetailsProps {
  psnr: string;
  bitrate: string;
  compressionType: string;
  codec: string;
}

const EncodingAdvancedDetails: React.FC<EncodingAdvancedDetailsProps> = ({
  psnr, bitrate, compressionType, codec
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="px-6 pb-6 mt-4">
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
        <div className="mt-2 grid grid-cols-2 gap-4 animate-fade-in">
          <div className="flex flex-col items-center p-3 rounded-lg border" style={{ background: '#fdfcfb', borderColor: '#e8e6e3' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-1" style={{ backgroundColor: '#f7f5f3' }}>
              <Signal className="w-2.5 h-2.5" style={{ color: '#6b7280' }} />
            </div>
            <span className="text-xs font-medium mb-1" style={{ color: '#6b7280' }}>PSNR</span>
            <span className="text-sm font-semibold" style={{ color: '#111827' }}>{psnr} dB</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-lg border" style={{ background: '#fdfcfb', borderColor: '#e8e6e3' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-1" style={{ backgroundColor: '#f7f5f3' }}>
              <HardDrive className="w-2.5 h-2.5" style={{ color: '#6b7280' }} />
            </div>
            <span className="text-xs font-medium mb-1" style={{ color: '#6b7280' }}>Bitrate</span>
            <span className="text-sm font-semibold" style={{ color: '#111827' }}>{bitrate} Mbps</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-lg border" style={{ background: '#fdfcfb', borderColor: '#e8e6e3' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-1" style={{ backgroundColor: '#f7f5f3' }}>
              <Monitor className="w-2.5 h-2.5" style={{ color: '#6b7280' }} />
            </div>
            <span className="text-xs font-medium mb-1" style={{ color: '#6b7280' }}>Compression Type</span>
            <span className="text-sm font-semibold" style={{ color: '#111827' }}>{compressionType}</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-lg border" style={{ background: '#fdfcfb', borderColor: '#e8e6e3' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-1" style={{ backgroundColor: '#f7f5f3' }}>
              <BarChart2 className="w-2.5 h-2.5" style={{ color: '#6b7280' }} />
            </div>
            <span className="text-xs font-medium mb-1" style={{ color: '#6b7280' }}>Codec</span>
            <span className="text-sm font-semibold" style={{ color: '#111827' }}>{codec}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EncodingAdvancedDetails;
