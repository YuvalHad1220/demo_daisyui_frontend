import React from 'react';
import { Clock } from 'lucide-react';

interface ProcessingDurationProps {
  duration: number;
}

const ProcessingDuration: React.FC<ProcessingDurationProps> = ({ duration }) => (
  <div className="px-6 pt-4 pb-2">
    <div className="text-center p-4 rounded-lg border inline-flex items-center space-x-3" style={{ borderColor: '#e8e6e3', background: '#fdfcfb' }}>
      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#dbeafe' }}>
        <Clock className="w-5 h-5" style={{ color: '#2563eb' }} />
      </div>
      <div className="text-left">
        <p className="text-xs font-medium mb-1" style={{ color: '#6b7280' }}>Processing Duration</p>
        <p className="text-sm font-semibold" style={{ color: '#111827' }}>{duration}s</p>
      </div>
    </div>
  </div>
);

export default ProcessingDuration;
