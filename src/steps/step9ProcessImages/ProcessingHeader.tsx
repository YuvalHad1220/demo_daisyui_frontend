import React from 'react';
import { Loader } from 'lucide-react';

const ProcessingHeader: React.FC = () => (
  <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: '#e8e6e3', borderBottomWidth: '1px' }}>
    <div className="flex items-center space-x-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f0fdfa' }}>
        <Loader className="w-4 h-4" style={{ color: '#14b8a6' }} />
      </div>
      <h2 className="text-lg font-semibold" style={{ color: '#111827' }}>
        Process Images
      </h2>
    </div>
  </div>
);

export default ProcessingHeader;
