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

// Add a request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add CSRF token for Django if available
    const csrfToken = getCSRFToken();
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
    
    // Add auth token if available
    const storage = getLocalStorage();
    const authData = storage.getItem('bluapt_auth');
    if (authData) {
      try {
        const { token } = JSON.parse(authData);
        if (token) {
          // Use the correct token format for Django REST framework TokenAuthentication
          config.headers['Authorization'] = `Token ${token}`;
          console.log('Added token to request:', token);
          console.log('Request headers:', config.headers);
        }
      } catch (error) {
        console.error('Error parsing auth data:', error);
      }
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
        // Redirect to login or refresh token
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