import React, { useState } from 'react';
import { BarChart2, FileText, ChevronDown, ChevronUp, CheckCircle, AlertCircle, Clock, Signal, Hash } from 'lucide-react';
import { StageCard } from '../components/ui/StageCard';

const Step6DecodingFinished: React.FC = () => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  // Simulated data
  const inputSize = 20.7; // MB
  const outputSize = 18.2; // MB
  const frameCount = 1800;
  const duration = 60; // seconds
  const psnr = 38.2; // dB (actual)
  const expectedPsnr = 40.0; // dB (expected)
  const ssim = 0.98;
  const quality = psnr > 37 ? 'high' : psnr > 32 ? 'medium' : 'low';
  const badgeColors = {
    high: { bg: '#e6f7f1', color: '#009966' },
    medium: { bg: '#fff7ed', color: '#f59e42' },
    low: { bg: '#fef2f2', color: '#ef4444' },
  };
  // For bar width calculation (max = 50 dB for visual scale)
  const maxPsnr = 50;

  return (
    <StageCard
      title="Decoding Summary"
      icon={BarChart2}
    >
      {/* Main Content */}
      <div className="px-6 py-8 flex flex-col items-center">
        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-6">
          <div className="text-center p-4 rounded-lg border" style={{ background: '#fdfcfb', borderColor: '#e8e6e3' }}>
            <div className="w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: '#dbeafe' }}>
              <Clock className="w-5 h-5" style={{ color: '#2563eb' }} />
            </div>
            <p className="text-xs font-medium mb-1" style={{ color: '#6b7280' }}>Duration</p>
            <p className="text-sm font-semibold" style={{ color: '#111827' }}>{duration}s</p>
          </div>
          <div className="text-center p-4 rounded-lg border" style={{ background: '#fdfcfb', borderColor: '#e8e6e3' }}>
            <div className="w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: '#fff7ed' }}>
              <Hash className="w-5 h-5" style={{ color: '#f59e42' }} />
            </div>
            <p className="text-xs font-medium mb-1" style={{ color: '#6b7280' }}>Frames</p>
            <p className="text-sm font-semibold" style={{ color: '#111827' }}>{frameCount}</p>
          </div>
          <div className="text-center p-4 rounded-lg border" style={{ background: '#fdfcfb', borderColor: '#e8e6e3' }}>
            <div className="w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: '#fefce8' }}>
              <Signal className="w-5 h-5" style={{ color: '#eab308' }} />
            </div>
            <p className="text-xs font-medium mb-1" style={{ color: '#6b7280' }}>PSNR</p>
            <p className="text-sm font-semibold" style={{ color: '#111827' }}>{psnr} dB</p>
          </div>
        </div>
        {/* PSNR Comparison Bar (full width) */}
        <div className="w-full mb-8">
          <div className="rounded-lg p-4 border" style={{ background: '#fdfcfb', borderColor: '#e8e6e3' }}>
            <div className="font-semibold text-sm mb-3" style={{ color: '#111827' }}>PSNR Comparison</div>
            <div className="space-y-3">
              {/* Expected PSNR */}
              <div className="flex items-center">
                <span className="flex items-center mr-3" style={{ minWidth: 90 }}>
                  <span className="w-3 h-3 rounded-full mr-2" style={{ background: '#14b8a6', display: 'inline-block' }}></span>
                  <span className="text-sm font-medium" style={{ color: '#111827' }}>Expected</span>
                </span>
                <div className="flex-1 h-3 bg-gray-200 rounded-full mr-3" style={{ position: 'relative' }}>
                  <div
                    className="h-3 rounded-full"
                    style={{
                      background: '#14b8a6',
                      width: `${(expectedPsnr / maxPsnr) * 100}%`,
                      transition: 'width 0.3s',
                    }}
                  />
                </div>
                <span className="text-base font-bold" style={{ color: '#111827', minWidth: 60, textAlign: 'right' }}>{expectedPsnr} dB</span>
              </div>
              {/* Actual PSNR */}
              <div className="flex items-center">
                <span className="flex items-center mr-3" style={{ minWidth: 90 }}>
                  <span className="w-3 h-3 rounded-full mr-2" style={{ background: '#f59e42', display: 'inline-block' }}></span>
                  <span className="text-sm font-medium" style={{ color: '#111827' }}>Actual</span>
                </span>
                <div className="flex-1 h-3 bg-gray-200 rounded-full mr-3" style={{ position: 'relative' }}>
                  <div
                    className="h-3 rounded-full"
                    style={{
                      background: '#f59e42',
                      width: `${(psnr / maxPsnr) * 100}%`,
                      transition: 'width 0.3s',
                    }}
                  />
                </div>
                <span className="text-base font-bold" style={{ color: '#111827', minWidth: 60, textAlign: 'right' }}>{psnr} dB</span>
              </div>
            </div>
          </div>
        </div>
        {/* Advanced Details Collapsible (full width) */}
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
              {/* Add more advanced details as needed */}
            </div>
          )}
        </div>
      </div>
    </StageCard>
  );
};

export default Step6DecodingFinished; 