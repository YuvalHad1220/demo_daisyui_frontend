import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorDisplayProps {
  error: string | null;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => (
  <div className="flex items-center space-x-2 mb-4 p-3 rounded-lg border" style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
    <AlertCircle className="w-4 h-4" style={{ color: '#ef4444' }} />
    <span className="text-sm font-medium" style={{ color: '#991b1b' }}>{error}</span>
  </div>
);

export default ErrorDisplay;
