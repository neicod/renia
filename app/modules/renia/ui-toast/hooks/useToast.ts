// @env: mixed
import React from 'react';
import { pushToast, type ToastItem, type ToastTone } from '../services/toastStore';

export type ToastInput = {
  title?: string;
  description?: string;
  tone?: ToastTone;
  duration?: number;
};

export const useToast = () => {
  return React.useCallback((toast: ToastInput) => {
    pushToast(toast);
  }, []);
};

export default useToast;
