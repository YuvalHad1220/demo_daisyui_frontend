import React from 'react';
import Toast from './Toast';
import { useWorkflow } from '../../hooks/useWorkflow';

const ToastContainer: React.FC = () => {
  const { toast } = useWorkflow()
  const { toasts, dismissToast } = toast;

  return (
    <div className="toast toast-end toast-bottom z-50">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          duration={toast.duration}
          onDismiss={dismissToast}
        />
      ))}
    </div>
  );
};

export default ToastContainer; 