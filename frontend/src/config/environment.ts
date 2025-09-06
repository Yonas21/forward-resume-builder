// Environment Configuration
// You can modify this file to change the API URL for different environments

export const ENVIRONMENT_CONFIG = {
  // Set to 'development' for local development
  // Set to 'production' for production deployment
  // Set to 'custom' to use a custom URL
  MODE: 'production' as 'development' | 'production' | 'custom',
  
  // Custom API URL (only used when MODE is 'custom')
  CUSTOM_API_URL: 'https://forward-resume-builder-production.up.railway.app',
  
  // Development API URL
  DEVELOPMENT_API_URL: 'http://localhost:8000',
  
  // Production API URL
  PRODUCTION_API_URL: 'https://forward-resume-builder-production.up.railway.app',
};

// Get the API URL based on the current mode
export const getApiUrl = (): string => {
  switch (ENVIRONMENT_CONFIG.MODE) {
    case 'development':
      return ENVIRONMENT_CONFIG.DEVELOPMENT_API_URL;
    case 'production':
      return ENVIRONMENT_CONFIG.PRODUCTION_API_URL;
    case 'custom':
      return ENVIRONMENT_CONFIG.CUSTOM_API_URL;
    default:
      return ENVIRONMENT_CONFIG.PRODUCTION_API_URL;
  }
};

// Log the current configuration
console.log('Environment Config:', {
  mode: ENVIRONMENT_CONFIG.MODE,
  apiUrl: getApiUrl(),
  isProduction: import.meta.env.PROD,
  isDevelopment: import.meta.env.DEV,
});
