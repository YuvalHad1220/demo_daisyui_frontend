import React from 'react';
import { Clock, Hash, Signal } from 'lucide-react';

interface DecodingStatsProps {
  duration: number;
  frameCount: number;
  psnr: number;
}

const DecodingStats: React.FC<DecodingStatsProps> = ({ duration, frameCount, psnr }) => {
  // Format duration as MM:SS
  const mins = Math.floor(duration / 60);
  const secs = Math.floor(duration % 60);
  const formattedDuration = `${mins}:${secs.toString().padStart(2, '0')}`;
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-6">
      <div className="text-center p-4 rounded-lg border" style={{ background: '#fdfcfb', borderColor: '#e8e6e3' }}>
        <div className="w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: '#dbeafe' }}>
          <Clock className="w-5 h-5" style={{ color: '#2563eb' }} />
        </div>
        <p className="text-xs font-medium mb-1" style={{ color: '#6b7280' }}>Decoding Time</p>
        <p className="text-sm font-semibold" style={{ color: '#111827' }}>{formattedDuration}</p>
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
  );
};

export default DecodingStats;
