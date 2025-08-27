import { useState, useEffect, useCallback } from 'react';

export interface MobileOptimizationConfig {
  enableTouchGestures?: boolean;
  enableSwipeNavigation?: boolean;
  enableTouchFeedback?: boolean;
}

export const useMobileOptimization = (config: MobileOptimizationConfig = {}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  // Detect device type and orientation
  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const isTabletDevice = /ipad|android(?=.*\b(?!.*mobile))/i.test(userAgent);
      
      setIsMobile(isMobileDevice);
      setIsTablet(isTabletDevice);
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    window.addEventListener('orientationchange', checkDevice);

    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
    };
  }, []);

  // Touch gesture handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!config.enableTouchGestures) return;
    
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  }, [config.enableTouchGestures]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!config.enableTouchGestures) return;
    
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  }, [config.enableTouchGestures]);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd || !config.enableSwipeNavigation) return;

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);

    if (isHorizontalSwipe && Math.abs(distanceX) > minSwipeDistance) {
      if (distanceX > 0) {
        // Swipe left - trigger next action
        const swipeEvent = new CustomEvent('swipe-left');
        document.dispatchEvent(swipeEvent);
      } else {
        // Swipe right - trigger previous action
        const swipeEvent = new CustomEvent('swipe-right');
        document.dispatchEvent(swipeEvent);
      }
    } else if (!isHorizontalSwipe && Math.abs(distanceY) > minSwipeDistance) {
      if (distanceY > 0) {
        // Swipe up - trigger up action
        const swipeEvent = new CustomEvent('swipe-up');
        document.dispatchEvent(swipeEvent);
      } else {
        // Swipe down - trigger down action
        const swipeEvent = new CustomEvent('swipe-down');
        document.dispatchEvent(swipeEvent);
      }
    }

    setTouchStart(null);
    setTouchEnd(null);
  }, [touchStart, touchEnd, config.enableSwipeNavigation]);

  // Touch feedback
  const addTouchFeedback = useCallback((element: HTMLElement) => {
    if (!config.enableTouchFeedback) return;

    const handleTouchStart = () => {
      element.style.transform = 'scale(0.95)';
      element.style.transition = 'transform 0.1s ease';
    };

    const handleTouchEnd = () => {
      element.style.transform = 'scale(1)';
    };

    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchend', handleTouchEnd);
    element.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [config.enableTouchFeedback]);

  // Mobile-specific utilities
  const isTouchDevice = useCallback(() => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }, []);

  const getTouchTargetSize = useCallback(() => {
    // Minimum touch target size (44px for iOS, 48px for Android)
    return isMobile ? 48 : 44;
  }, [isMobile]);

  const preventZoom = useCallback(() => {
    // Prevent zoom on double tap
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (event) => {
      const now = (new Date()).getTime();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, false);
  }, []);

  return {
    isMobile,
    isTablet,
    orientation,
    isTouchDevice: isTouchDevice(),
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    addTouchFeedback,
    getTouchTargetSize,
    preventZoom,
  };
};
