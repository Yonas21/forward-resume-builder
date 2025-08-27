import React from 'react';
import { useMobileOptimization, type MobileOptimizationConfig } from '../hooks/useMobileOptimization';

// Mobile-optimized component wrapper
export const withMobileOptimization = <P extends object>(
  Component: React.ComponentType<P>,
  config?: MobileOptimizationConfig
) => {
  return (props: P) => {
    const mobileOpts = useMobileOptimization(config);
    
    return (
      <Component
        {...props}
        mobileOpts={mobileOpts}
      />
    );
  };
};

// Touch-friendly button component
export const TouchButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  touchFeedback?: boolean;
}> = ({ children, onClick, disabled, className = '' }) => {
  const { getTouchTargetSize } = useMobileOptimization();
  const minSize = getTouchTargetSize();

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`touch-manipulation ${className}`}
      style={{
        minHeight: `${minSize}px`,
        minWidth: `${minSize}px`,
        touchAction: 'manipulation',
      }}
    >
      {children}
    </button>
  );
};
