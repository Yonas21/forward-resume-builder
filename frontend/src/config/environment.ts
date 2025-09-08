// Environment Configuration
// Automatically detects environment based on Vite's import.meta.env

export const ENVIRONMENT_CONFIG = {
  // Development API URL (for local development)
  DEVELOPMENT_API_URL: 'http://localhost:8000',
  
  // Production API URL (for production deployment)
  PRODUCTION_API_URL: 'https://forward-resume-builder-production.up.railway.app',
  
  // Custom API URL (can be overridden via environment variables)
  CUSTOM_API_URL: import.meta.env.VITE_API_URL || 'https://forward-resume-builder-production.up.railway.app',
};

// Determine if we're in development mode based on environment variables
const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';

// Get the API URL based on the current environment
export const getApiUrl = (): string => {
  // If custom API URL is provided via environment variable, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Use development URL for local development, production URL otherwise
  return isDevelopment 
    ? ENVIRONMENT_CONFIG.DEVELOPMENT_API_URL 
    : ENVIRONMENT_CONFIG.PRODUCTION_API_URL;
};

// Log the current configuration
console.log('Environment Config:', {
  isDevelopment,
  isProduction: import.meta.env.PROD,
  mode: import.meta.env.MODE,
  apiUrl: getApiUrl(),
  customApiUrl: import.meta.env.VITE_API_URL || 'not set',
  selectedUrl: isDevelopment ? 'development' : 'production',
});
