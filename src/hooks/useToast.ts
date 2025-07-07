import { useState, useCallback, useMemo, useEffect } from 'react';
import type { ToastType } from '../components/ui/Toast';

export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface UseToastReturn {
  toasts: ToastData[];
  showToast: (toast: Omit<ToastData, 'id'>) => void;
  showSuccess: (title: string, message?: string, duration?: number) => void;
  showError: (title: string, message?: string, duration?: number) => void;
  showInfo: (title: string, message?: string, duration?: number) => void;
  showWarning: (title: string, message?: string, duration?: number) => void;
  showLoading: (title: string, message?: string) => void;
  dismissToast: (id: string) => void;
  dismissAll: () => void;
}

export const useToast = (): UseToastReturn => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const generateId = useCallback(() => {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const showToast = useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = generateId();
    const newToast: ToastData = {
      id,
      ...toast,
    };
    
    setToasts(prev => [...prev, newToast]);
  }, [generateId]);

  const showSuccess = useCallback((title: string, message?: string, duration = 4000) => {
    showToast({ type: 'success', title, message, duration });
  }, [showToast]);

  const showError = useCallback((title: string, message?: string, duration = 6000) => {
    showToast({ type: 'error', title, message, duration });
  }, [showToast]);

  const showInfo = useCallback((title: string, message?: string, duration = 4000) => {
    showToast({ type: 'info', title, message, duration });
  }, [showToast]);

  const showWarning = useCallback((title: string, message?: string, duration = 5000) => {
    showToast({ type: 'warning', title, message, duration });
  }, [showToast]);

  const showLoading = useCallback((title: string, message?: string) => {
    showToast({ type: 'loading', title, message, duration: 0 }); // 0 = no auto-dismiss
  }, [showToast]);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  return useMemo(() => ({
    toasts,
    showToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showLoading,
    dismissToast,
    dismissAll,
  }), [
    toasts,
    showToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showLoading,
    dismissToast,
    dismissAll,
  ]);
}; 