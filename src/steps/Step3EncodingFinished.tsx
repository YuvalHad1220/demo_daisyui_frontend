import React, { useState } from 'react';
import { Zap, Clock, TrendingDown, BarChart2, ChevronDown, ChevronUp, FileText, Signal, HardDrive, Monitor } from 'lucide-react';
import { StageCard } from '../components/ui/StageCard';
import { FileInfoCard } from '../components/ui/FileInfoCard';
import { useWorkflow } from '../hooks/useWorkflow';

const Step3EncodingFinished: React.FC = () => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { encoding } = useWorkflow();
  const { encodingResult } = encoding;

  if (!encodingResult) {
    return (
      <StageCard title="Video Encoding" icon={Zap}>
        <div className="flex flex-col items-center justify-center h-full py-12">
          <div className="w-14 h-14 flex items-center justify-center rounded-full mb-4 animate-spin" style={{ background: 'rgba(245,158,66,0.08)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="#f59e42" strokeWidth="4" fill="none" opacity="0.2" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="#f59e42" strokeWidth="4" fill="none" strokeLinecap="round" />
            </svg>
          </div>
          <span className="font-semibold text-xl" style={{ color: '#111827' }}>Finalizing Encoding...</span>
        </div>
      </StageCard>
    );
  }

  const { inputSize, outputSize, duration, psnr, compressionType, codec, bitrate } = encodingResult;
  const saved = (inputSize - outputSize).toFixed(2); // MB
  const compression = Math.round(((inputSize - outputSize) / inputSize) * 100);

  return (
    <StageCard title="Video Encoding" icon={Zap}>
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-6 mt-6">
        <FileInfoCard
          icon={Clock}
          iconColor="#2563eb"
          backgroundColor="#dbeafe"
          label="Duration"
          value={`${duration}s`}
        />
        <FileInfoCard
          icon={TrendingDown}
          iconColor="#14b8a6"
          backgroundColor="#f0fdfa"
          label="Compression"
          value={`${compression}.0%`}
        />
        <FileInfoCard
          icon={BarChart2}
          iconColor="#7c3aed"
          backgroundColor="#faf5ff"
          label="Saved"
          value={`${saved} MB`}
        />
      </div>
      {/* Bar Chart */}
      <div className="px-6 mt-8">
        <div className="bg-gray-50 rounded-lg p-4 border" style={{ borderColor: '#e5e7eb' }}>
          <div className="font-semibold text-sm mb-3" style={{ color: '#374151' }}>Size Comparison</div>
          <div className="flex items-end justify-between h-32 w-full relative" style={{ maxWidth: 400, margin: '0 auto' }}>
            {/* Y axis grid */}
            <div className="absolute left-0 top-0 w-full h-full z-0" style={{ pointerEvents: 'none' }}>
              {[1,2,3,4,5].map(i => (
                <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: `${(i-1)*25}%`, borderTop: '1px dashed #e5e7eb', height: 0 }} />
              ))}
            </div>
            {/* Bars */}
            <div className="flex flex-col items-center z-10 w-1/2">
              <div style={{ height: `${inputSize * 4}px`, background: '#ef4444', width: 48, borderRadius: 12, transition: 'height 0.4s' }}></div>
              <span className="text-xs mt-2 font-medium" style={{ color: '#ef4444' }}>Original</span>
              <span className="text-xs" style={{ color: '#6b7280' }}>{inputSize} MB</span>
            </div>
            <div className="flex flex-col items-center z-10 w-1/2">
              <div style={{ height: `${outputSize * 4}px`, background: '#14b8a6', width: 48, borderRadius: 12, transition: 'height 0.4s' }}></div>
              <span className="text-xs mt-2 font-medium" style={{ color: '#14b8a6' }}>Encoded</span>
              <span className="text-xs" style={{ color: '#6b7280' }}>{outputSize} MB</span>
            </div>
          </div>
        </div>
      </div>
      {/* Advanced Details Collapsible */}
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
            <div className="flex flex-col items-center p-3 rounded-lg border" style={{ background: '#fafafa', borderColor: '#e5e7eb' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-1" style={{ backgroundColor: '#f3f4f6' }}>
                <Signal className="w-2.5 h-2.5" style={{ color: '#6b7280' }} />
              </div>
              <span className="text-xs font-medium mb-1" style={{ color: '#6b7280' }}>PSNR</span>
              <span className="text-sm font-semibold" style={{ color: '#111827' }}>{psnr} dB</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-lg border" style={{ background: '#fafafa', borderColor: '#e5e7eb' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-1" style={{ backgroundColor: '#f3f4f6' }}>
                <HardDrive className="w-2.5 h-2.5" style={{ color: '#6b7280' }} />
              </div>
              <span className="text-xs font-medium mb-1" style={{ color: '#6b7280' }}>Bitrate</span>
              <span className="text-sm font-semibold" style={{ color: '#111827' }}>{bitrate} Mbps</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-lg border" style={{ background: '#fafafa', borderColor: '#e5e7eb' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-1" style={{ backgroundColor: '#f3f4f6' }}>
                <Monitor className="w-2.5 h-2.5" style={{ color: '#6b7280' }} />
              </div>
              <span className="text-xs font-medium mb-1" style={{ color: '#6b7280' }}>Compression Type</span>
              <span className="text-sm font-semibold" style={{ color: '#111827' }}>{compressionType}</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-lg border" style={{ background: '#fafafa', borderColor: '#e5e7eb' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-1" style={{ backgroundColor: '#f3f4f6' }}>
                <BarChart2 className="w-2.5 h-2.5" style={{ color: '#6b7280' }} />
              </div>
              <span className="text-xs font-medium mb-1" style={{ color: '#6b7280' }}>Codec</span>
              <span className="text-sm font-semibold" style={{ color: '#111827' }}>{codec}</span>
            </div>
          </div>
        )}
      </div>
    </StageCard>
  );
};

export default Step3EncodingFinished; 