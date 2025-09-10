// Environment Configuration
// Automatically detects environment based on Vite's import.meta.env

export const ENVIRONMENT_CONFIG = {
  // Development API URL (for local development)
  DEVELOPMENT_API_URL: 'http://localhost:8000',
  
  // Production API URL (for production deployment)
  PRODUCTION_API_URL: 'https://forward-resume-builder-production.up.railway.app',
  
  // Custom API URL (can be overridden via environment variables)
  CUSTOM_API_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
};

// Determine if we're in development mode based on multiple indicators
const isDevelopment = 
  import.meta.env.DEV || 
  import.meta.env.MODE === 'development' ||
  import.meta.env.NODE_ENV === 'development' ||
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.port === '5173' ||
  window.location.port === '3000';

// Get the API URL based on the current environment
export const getApiUrl = (): string => {
  // ALWAYS use localhost for local development - multiple fallback mechanisms
  if (isDevelopment) {
    console.log('🔧 Development mode detected, forcing localhost:8000');
    return 'http://localhost:8000';
  }
  
  // Check if we're running on localhost (additional safety check)
  if (typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || 
       window.location.hostname === '127.0.0.1' ||
       window.location.port === '5173' ||
       window.location.port === '3000')) {
    console.log('🔧 Localhost detected, forcing localhost:8000');
    return 'http://localhost:8000';
  }
  
  // If custom API URL is provided via environment variable, use it
  if (import.meta.env.VITE_API_URL) {
    console.log('🔧 Using custom API URL from VITE_API_URL:', import.meta.env.VITE_API_URL);
    return import.meta.env.VITE_API_URL;
  }
  
  // Use production URL for production
  const selectedUrl = ENVIRONMENT_CONFIG.PRODUCTION_API_URL;
  console.log('🔧 Selected API URL:', selectedUrl, '(isDevelopment:', isDevelopment, ')');
  return selectedUrl;
};

// Log the current configuration
console.log('🔧 Environment Config:', {
  isDevelopment,
  isProduction: import.meta.env.PROD,
  mode: import.meta.env.MODE,
  apiUrl: getApiUrl(),
  customApiUrl: import.meta.env.VITE_API_URL || 'not set',
  selectedUrl: isDevelopment ? 'development' : 'production',
  dev: import.meta.env.DEV,
  allEnvVars: {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    NODE_ENV: import.meta.env.NODE_ENV,
  }
});
