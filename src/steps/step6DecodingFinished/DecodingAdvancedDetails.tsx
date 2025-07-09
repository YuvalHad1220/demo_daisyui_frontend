import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronUp, BarChart2, Zap, TrendingUp, Database, ZapOff } from 'lucide-react';

interface DecodingAdvancedDetailsProps {
  ssim?: number;
  psnrStd?: number;
  processedSequences?: number;
  bitrateMbps?: number;
  memoryIncreaseMB?: number;
  lightningEnabled?: boolean;
}

const DecodingAdvancedDetails: React.FC<DecodingAdvancedDetailsProps> = ({
  ssim, psnrStd, processedSequences, bitrateMbps, memoryIncreaseMB, lightningEnabled
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
          {ssim !== undefined && (
            <div className="flex flex-col items-center p-3 rounded-lg border" style={{ background: '#fdfcfb', borderColor: '#e8e6e3' }}>
              <BarChart2 className="w-4 h-4 mb-1" style={{ color: '#6b7280' }} />
              <span className="text-xs font-medium mb-1" style={{ color: '#6b7280' }}>SSIM</span>
              <span className="text-sm font-semibold" style={{ color: '#111827' }}>{ssim}</span>
            </div>
          )}
          {psnrStd !== undefined && (
            <div className="flex flex-col items-center p-3 rounded-lg border" style={{ background: '#fdfcfb', borderColor: '#e8e6e3' }}>
              <Zap className="w-4 h-4 mb-1" style={{ color: '#6b7280' }} />
              <span className="text-xs font-medium mb-1" style={{ color: '#6b7280' }}>PSNR Std</span>
              <span className="text-sm font-semibold" style={{ color: '#111827' }}>{psnrStd}</span>
            </div>
          )}
          {processedSequences !== undefined && (
            <div className="flex flex-col items-center p-3 rounded-lg border" style={{ background: '#fdfcfb', borderColor: '#e8e6e3' }}>
              <TrendingUp className="w-4 h-4 mb-1" style={{ color: '#6b7280' }} />
              <span className="text-xs font-medium mb-1" style={{ color: '#6b7280' }}>Processed Sequences</span>
              <span className="text-sm font-semibold" style={{ color: '#111827' }}>{processedSequences}</span>
            </div>
          )}
          {bitrateMbps !== undefined && (
            <div className="flex flex-col items-center p-3 rounded-lg border" style={{ background: '#fdfcfb', borderColor: '#e8e6e3' }}>
              <Database className="w-4 h-4 mb-1" style={{ color: '#6b7280' }} />
              <span className="text-xs font-medium mb-1" style={{ color: '#6b7280' }}>Bitrate (Mbps)</span>
              <span className="text-sm font-semibold" style={{ color: '#111827' }}>{bitrateMbps}</span>
            </div>
          )}
          {memoryIncreaseMB !== undefined && (
            <div className="flex flex-col items-center p-3 rounded-lg border" style={{ background: '#fdfcfb', borderColor: '#e8e6e3' }}>
              <ZapOff className="w-4 h-4 mb-1" style={{ color: '#6b7280' }} />
              <span className="text-xs font-medium mb-1" style={{ color: '#6b7280' }}>Memory Increase (MB)</span>
              <span className="text-sm font-semibold" style={{ color: '#111827' }}>{memoryIncreaseMB}</span>
            </div>
          )}
          {lightningEnabled !== undefined && (
            <div className="flex flex-col items-center p-3 rounded-lg border" style={{ background: '#fdfcfb', borderColor: '#e8e6e3' }}>
              <Zap className="w-4 h-4 mb-1" style={{ color: '#6b7280' }} />
              <span className="text-xs font-medium mb-1" style={{ color: '#6b7280' }}>Lightning Enabled</span>
              <span className="text-sm font-semibold" style={{ color: '#111827' }}>{lightningEnabled ? 'Yes' : 'No'}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DecodingAdvancedDetails;
