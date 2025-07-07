import React from 'react';

interface PsnrComparisonBarProps {
  psnr: number;
  expectedPsnr: number;
  maxPsnr: number;
}

const PsnrComparisonBar: React.FC<PsnrComparisonBarProps> = ({
  psnr, expectedPsnr, maxPsnr
}) => (
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
);

export default PsnrComparisonBar;
