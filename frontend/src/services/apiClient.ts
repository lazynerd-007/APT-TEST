import axios from 'axios';
import { API_URL } from '../config';

// Safe access to window object
const getWindow = () => {
  return typeof window !== 'undefined' ? window : null;
};

// Safe access to localStorage
const getLocalStorage = () => {
  if (typeof window !== 'undefined') {
    return window.localStorage;
  }
  return {
    getItem: () => null,
    setItem: () => null,
    removeItem: () => null
  };
};

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false, // Set to true only when needed for cookies
});

// Function to get CSRF token from cookie
const getCSRFToken = () => {
  if (typeof document === 'undefined') return null;
  
  const name = 'csrftoken=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(';');
  
  for (let i = 0; i < cookieArray.length; i++) {
    let cookie = cookieArray[i].trim();
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length, cookie.length);
    }
  }
  return null;
};

// Function to get auth token from storage
const getAuthToken = () => {
  try {
    const storage = getLocalStorage();
    const authData = storage.getItem('bluapt_auth');
    if (!authData) return null;
    
    const parsed = JSON.parse(authData);
    return parsed.token || null;
  } catch (error) {
    console.error('Error retrieving auth token:', error);
    return null;
  }
};

// Add a request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add CSRF token for Django if available
    const csrfToken = getCSRFToken();
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
    
    // Add auth token if available
    const token = getAuthToken();
    if (token) {
      // Always use Bearer token format which is more universally accepted
      // Django REST framework accepts both "Token" and "Bearer" prefixes
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('Added Bearer token to request');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors here
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error Response:', error.response.status, error.response.data);
      
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        // Check if this might be due to an invalid token
        if (error.response.data?.detail === "Invalid token.") {
          console.error('Authentication failed: Invalid token');
          
          // For development purposes, let's log more details that might help debug
          const token = getAuthToken();
          if (token) {
            console.log('Current token that failed authentication:', token);
            
            // If the token starts with 'dev-token-', it's our demo token that won't work with the backend
            if (token.startsWith('dev-token-')) {
              console.warn('Using a demo development token that is not valid for real API calls!');
              console.warn('For development, please implement a proper auth mechanism or use the mock API');
            }
          } else {
            console.warn('No authentication token found in localStorage');
          }
          
          // Clear the invalid token
          const storage = getLocalStorage();
          if (storage) {
            // Don't fully clear auth - keep user data for demo purposes
            try {
              const authData = JSON.parse(storage.getItem('bluapt_auth') || '{}');
              authData.token = null; // Clear the token but keep user data
              storage.setItem('bluapt_auth', JSON.stringify(authData));
            } catch (e) {
              // If parsing fails, just remove the entire item
              storage.removeItem('bluapt_auth');
            }
          }
          
          // Don't redirect automatically for auth errors, return a clear error
          return Promise.reject(new Error('Authentication failed. Please log in to continue.'));
        }
        
        // Regular unauthorized error - redirect to login
        console.log('Unauthorized - redirecting to login');
        const win = getWindow();
        if (win) {
          win.location.href = '/login';
        }
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API Error Request:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Error Message:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient; 