import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X, Loader } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'loading';

export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onDismiss: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 4000,
  onDismiss
}) => {
  useEffect(() => {
    if (duration > 0 && type !== 'loading') {
      const dismissTimer = setTimeout(() => {
        onDismiss(id);
      }, duration);

      return () => {
        clearTimeout(dismissTimer);
      };
    }
  }, [duration, type, id, onDismiss]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5" />;
      case 'loading':
        return <Loader className="w-5 h-5 animate-spin" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getAlertTypeClass = () => {
    switch (type) {
      case 'success':
        return 'alert-success';
      case 'error':
        return 'alert-error';
      case 'warning':
        return 'alert-warning';
      case 'info':
        return 'alert-info';
      case 'loading':
        return 'alert-info'; // DaisyUI doesn't have a specific loading alert type, using info
      default:
        return 'alert-info';
    }
  };

  return (
    <div className={`alert ${getAlertTypeClass()}`}>
      {getIcon()}
      <div>
        <h3 className="font-bold">{title}</h3>
        {message && <div className="text-xs">{message}</div>}
      </div>
      <button className="btn btn-sm btn-circle" onClick={() => onDismiss(id)}>
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast; 