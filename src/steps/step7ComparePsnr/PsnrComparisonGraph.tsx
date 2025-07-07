import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { codecNames, codecColors } from '../../hooks/usePsnrComparison';

interface PsnrComparisonGraphProps {
  psnrData: Record<string, number>;
}

const PsnrComparisonGraph: React.FC<PsnrComparisonGraphProps> = ({ psnrData }) => {
  const [showPSNRComparison, setShowPSNRComparison] = useState<boolean>(false);

  return (
    <div className="rounded-lg border" style={{ background: '#fdfcfb', borderColor: '#e8e6e3' }}>
      <button
        onClick={() => setShowPSNRComparison(!showPSNRComparison)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-100 transition-colors"
      >
        <h3 className="font-semibold text-lg" style={{ color: '#111827' }}>
          PSNR Comparison
        </h3>
        {showPSNRComparison ? (
          <ChevronUp className="w-5 h-5" style={{ color: '#14b8a6' }} />
        ) : (
          <ChevronDown className="w-5 h-5" style={{ color: '#14b8a6' }} />
        )}
      </button>
      
      {showPSNRComparison && (
        <div className="px-6 pb-6 animate-fade-in">
          <div className="space-y-4">
            {Object.entries(psnrData).map(([codec, psnr]) => (
              <div key={codec} className="flex items-center space-x-4">
                <div className="flex items-center space-x-2" style={{ minWidth: '100px' }}>
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: codecColors[codec].bg }}
                  />
                  <span className="text-sm font-medium" style={{ color: '#111827' }}>
                    {codecNames[codec]}
                  </span>
                </div>
                
                <div className="flex-1 h-4 bg-gray-200 rounded-full relative">
                  <div
                    className="h-4 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: codecColors[codec].bg,
                      width: `${Math.min((psnr / 50) * 100, 100)}%`
                    }}
                  />
                </div>
                
                <span 
                  className="text-sm font-semibold"
                  style={{ 
                    color: codecColors[codec].bg,
                    minWidth: '60px',
                    textAlign: 'right'
                  }}
                >
                  {psnr.toFixed(1)} dB
                </span>
              </div>
            ))}
          </div>
          
          {/* Codec Legend */}
          <div className="mt-6 pt-4 border-t flex items-center justify-center space-x-6" style={{ borderColor: '#e5e7eb' }}>
            {Object.entries(codecColors).map(([codec, colors]) => (
              <div key={codec} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: colors.bg }} 
                />
                <span className="text-xs" style={{ color: '#6b7280' }}>
                  {codecNames[codec]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PsnrComparisonGraph;
