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

// Get the API URL based on the current environment
export const getApiUrl = (): string => {
  // Check if we're running on localhost (development)
  if (typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || 
       window.location.hostname === '127.0.0.1' ||
       window.location.port === '5173' ||
       window.location.port === '3000')) {
    console.log('🔧 Localhost detected, using development API:', ENVIRONMENT_CONFIG.DEVELOPMENT_API_URL);
    return ENVIRONMENT_CONFIG.DEVELOPMENT_API_URL;
  }
  
  // Check if we're running on HTTPS (production)
  if (typeof window !== 'undefined' && 
      (window.location.protocol === 'https:' || 
       window.location.hostname.includes('railway.app') ||
       window.location.hostname.includes('vercel.app') ||
       window.location.hostname.includes('netlify.app') ||
       window.location.hostname.includes('github.io'))) {
    console.log('🔧 Production environment detected, using production API:', ENVIRONMENT_CONFIG.PRODUCTION_API_URL);
    return ENVIRONMENT_CONFIG.PRODUCTION_API_URL;
  }
  
  // If custom API URL is provided via environment variable, use it
  if (import.meta.env.VITE_API_URL) {
    console.log('🔧 Using custom API URL from VITE_API_URL:', import.meta.env.VITE_API_URL);
    return import.meta.env.VITE_API_URL;
  }
  
  // Fallback: Use production URL for production builds, development for dev builds
  const isProductionBuild = import.meta.env.PROD;
  const selectedUrl = isProductionBuild ? ENVIRONMENT_CONFIG.PRODUCTION_API_URL : ENVIRONMENT_CONFIG.DEVELOPMENT_API_URL;
  console.log('🔧 Fallback selection - isProductionBuild:', isProductionBuild, 'selectedUrl:', selectedUrl);
  return selectedUrl;
};

// Log the current configuration
console.log('🔧 Environment Config:', {
  isProduction: import.meta.env.PROD,
  mode: import.meta.env.MODE,
  apiUrl: getApiUrl(),
  customApiUrl: import.meta.env.VITE_API_URL || 'not set',
  hostname: typeof window !== 'undefined' ? window.location.hostname : 'server-side',
  protocol: typeof window !== 'undefined' ? window.location.protocol : 'server-side',
  port: typeof window !== 'undefined' ? window.location.port : 'server-side',
  dev: import.meta.env.DEV,
  allEnvVars: {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    NODE_ENV: import.meta.env.NODE_ENV,
  }
});
