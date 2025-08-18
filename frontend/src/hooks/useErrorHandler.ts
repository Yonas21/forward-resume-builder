import { useState, useCallback } from 'react';

export interface ErrorInfo {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  timestamp: Date;
  action?: {
    label: string;
    handler: () => void;
  };
}

export const useErrorHandler = () => {
  const [errors, setErrors] = useState<ErrorInfo[]>([]);

  const addError = useCallback((message: string, type: 'error' | 'warning' | 'info' = 'error', action?: { label: string; handler: () => void }) => {
    const error: ErrorInfo = {
      id: Date.now().toString(),
      message,
      type,
      timestamp: new Date(),
      action,
    };
    
    setErrors(prev => [...prev, error]);

    // Auto-remove errors after 10 seconds
    setTimeout(() => {
      removeError(error.id);
    }, 10000);
  }, []);

  const removeError = useCallback((id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const handleApiError = useCallback((error: any, context?: string) => {
    let message = 'An unexpected error occurred';
    
    if (error.response?.data?.detail) {
      message = error.response.data.detail;
    } else if (error.response?.status === 401) {
      message = 'Please log in to continue';
    } else if (error.response?.status === 403) {
      message = 'You don\'t have permission to perform this action';
    } else if (error.response?.status === 404) {
      message = 'The requested resource was not found';
    } else if (error.response?.status === 500) {
      message = 'Server error. Please try again later';
    } else if (error.message) {
      message = error.message;
    }

    if (context) {
      message = `${context}: ${message}`;
    }

    addError(message, 'error');
  }, [addError]);

  const handleNetworkError = useCallback((context?: string) => {
    const message = context 
      ? `${context}: Please check your internet connection and try again`
      : 'Network error. Please check your internet connection and try again';
    
    addError(message, 'error', {
      label: 'Retry',
      handler: () => window.location.reload(),
    });
  }, [addError]);

  const handleValidationError = useCallback((errors: Record<string, string[]>, context?: string) => {
    const messages = Object.values(errors).flat();
    const message = context 
      ? `${context}: ${messages.join(', ')}`
      : messages.join(', ');
    
    addError(message, 'warning');
  }, [addError]);

  return {
    errors,
    addError,
    removeError,
    clearErrors,
    handleApiError,
    handleNetworkError,
    handleValidationError,
  };
};
