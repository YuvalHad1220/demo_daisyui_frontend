import React, { useState } from 'react';
import { Zap, Clock, TrendingDown, BarChart2, ChevronDown, ChevronUp, FileText, Signal, HardDrive, Monitor } from 'lucide-react';
import { StageCard } from '../components/ui/StageCard';
import { FileInfoCard } from '../components/ui/FileInfoCard';
import LoadingCircular from '../components/ui/LoadingCircular';
import { useWorkflow } from '../hooks/useWorkflow';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AppButton } from '../components/ui/AppButton';

const Step3EncodingFinished: React.FC = () => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { encoding } = useWorkflow();
  const { encodingResult } = encoding;

  if (!encodingResult) {
    return (
      <StageCard title="Video Encoding" icon={Zap}>
        <div className="flex flex-col items-center justify-center h-full py-12">
          <LoadingCircular size="md" className="mb-4" />
          <span className="font-semibold text-xl" style={{ color: '#111827' }}>Finalizing Encoding...</span>
        </div>
      </StageCard>
    );
  }

  const { inputSize, outputSize, duration, psnr, compressionType, codec, bitrate } = encodingResult;
  const saved = (inputSize - outputSize).toFixed(2); // MB
  const compression = Math.round(((inputSize - outputSize) / inputSize) * 100);

  const chartData = [
    { name: 'Original', size: inputSize, color: '#ef4444' },
    { name: 'Encoded', size: outputSize, color: '#14b8a6' },
  ];

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
        <div className="rounded-lg p-4 border" style={{ background: '#fdfcfb', borderColor: '#e8e6e3' }}>
          <div className="font-semibold text-sm mb-3" style={{ color: '#374151' }}>Size Comparison</div>
          <div style={{ width: '100%', height: 180, maxWidth: 400, margin: '0 auto' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} />
                <Tooltip formatter={(value: number) => `${value} MB`} />
                <Bar dataKey="size" radius={[8, 8, 8, 8]}>
                  {chartData.map((entry, index) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
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
    </StageCard>
  );
};

export default Step3EncodingFinished; 