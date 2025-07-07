import React from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

interface GlobalErrorProps {
  searchError: string | null;
  handleRetry: () => void;
}

const GlobalError: React.FC<GlobalErrorProps> = ({ searchError, handleRetry }) => (
  <div className="mt-6 flex items-start space-x-3 p-4 rounded-lg" style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#fee2e2' }}>
      <AlertCircle className="w-4 h-4" style={{ color: '#ef4444' }} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-semibold" style={{ color: '#dc2626' }}>Processing Error</p>
      <p className="text-sm" style={{ color: '#991b1b' }}>{searchError}</p>
      <button
        className="mt-3 px-4 py-2 rounded text-sm font-medium flex items-center space-x-2 transition-colors"
        style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}
        onClick={handleRetry}
      >
        <RefreshCcw className="w-4 h-4" />
        <span>Retry Processing</span>
      </button>
    </div>
  </div>
);

export default GlobalError;
