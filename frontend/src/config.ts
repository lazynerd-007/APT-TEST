// API configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// Log the API URL in development to help with debugging
if (process.env.NODE_ENV !== 'production') {
  console.log('🌐 API_URL:', API_URL);
  console.log('🌐 API_BASE_URL:', API_BASE_URL);
}

// Authentication configuration
export const AUTH_TOKEN_KEY = 'bluapt_auth';

// Application configuration
export const APP_NAME = 'BLUAPT';
export const APP_DESCRIPTION = 'Skills-based hiring platform'; 