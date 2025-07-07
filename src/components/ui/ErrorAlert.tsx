import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorAlertProps {
  title: string;
  message: string | undefined;
  className?: string;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ title, message, className = '' }) => {
  if (!message) return null;

  return (
    <div className={`flex items-start space-x-3 p-4 rounded-lg border ${className}`} style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#fee2e2' }}>
        <AlertCircle className="w-4 h-4" style={{ color: '#ef4444' }} />
      </div>
      <div>
        <p className="font-semibold" style={{ color: '#dc2626' }}>{title}</p>
        <p className="text-sm" style={{ color: '#991b1b' }}>{message}</p>
      </div>
    </div>
  );
};
