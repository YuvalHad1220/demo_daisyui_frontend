import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronUp, Signal, HardDrive, Monitor, BarChart2, Clock } from 'lucide-react';

interface EncodingAdvancedDetailsProps {
  bitrate: number;
  method: string;
  deviceUsed: string;
  memoryUsageBytes: number;
  videoFrames: number;
  fps: number;
  validSequences: number;
  duration: number;
}

const EncodingAdvancedDetails: React.FC<EncodingAdvancedDetailsProps> = ({
  bitrate, method, deviceUsed, memoryUsageBytes, videoFrames, fps, validSequences, duration
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
            <span className="text-xs font-medium mb-1" style={{ color: '#6b7280' }}>Bitrate</span>
            <span className="text-sm font-semibold" style={{ color: '#111827' }}>{bitrate.toFixed(1)} Mbps</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-lg border" style={{ background: '#fdfcfb', borderColor: '#e8e6e3' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-1" style={{ backgroundColor: '#f7f5f3' }}>
              <HardDrive className="w-2.5 h-2.5" style={{ color: '#6b7280' }} />
            </div>
            <span className="text-xs font-medium mb-1" style={{ color: '#6b7280' }}>Device</span>
            <span className="text-sm font-semibold" style={{ color: '#111827' }}>{deviceUsed.toUpperCase()}</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-lg border" style={{ background: '#fdfcfb', borderColor: '#e8e6e3' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-1" style={{ backgroundColor: '#f7f5f3' }}>
              <Monitor className="w-2.5 h-2.5" style={{ color: '#6b7280' }} />
            </div>
            <span className="text-xs font-medium mb-1" style={{ color: '#6b7280' }}>Frames</span>
            <span className="text-sm font-semibold" style={{ color: '#111827' }}>{videoFrames} ({fps} fps)</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-lg border" style={{ background: '#fdfcfb', borderColor: '#e8e6e3' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-1" style={{ backgroundColor: '#f7f5f3' }}>
              <BarChart2 className="w-2.5 h-2.5" style={{ color: '#6b7280' }} />
            </div>
            <span className="text-xs font-medium mb-1" style={{ color: '#6b7280' }}>Memory Usage</span>
            <span className="text-sm font-semibold" style={{ color: '#111827' }}>{(memoryUsageBytes / (1024 * 1024)).toFixed(1)} MB</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-lg border" style={{ background: '#fdfcfb', borderColor: '#e8e6e3' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-1" style={{ backgroundColor: '#f7f5f3' }}>
              <Clock className="w-2.5 h-2.5" style={{ color: '#6b7280' }} />
            </div>
            <span className="text-xs font-medium mb-1" style={{ color: '#6b7280' }}>Video Duration</span>
            <span className="text-sm font-semibold" style={{ color: '#111827' }}>{duration.toFixed(1)}s</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-lg border" style={{ background: '#fdfcfb', borderColor: '#e8e6e3' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-1" style={{ backgroundColor: '#f7f5f3' }}>
              <FileText className="w-2.5 h-2.5" style={{ color: '#6b7280' }} />
            </div>
            <span className="text-xs font-medium mb-1" style={{ color: '#6b7280' }}>Method</span>
            <span className="text-sm font-semibold text-center" style={{ color: '#111827' }}>{method}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EncodingAdvancedDetails;
