import axios from 'axios';
import apiClient from './apiClient';
import { API_URL } from '../config';

// Types
export interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  category_name?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface SkillCategory {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface SkillCreateData {
  name: string;
  description: string;
  category: string;
  difficulty: Skill['difficulty'];
  tags?: string[];
}

export interface SkillCategoryCreateData {
  name: string;
  description: string;
}

// Create a public client with retry logic for read operations
const publicClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add CSRF token if available (for all requests including unauthenticated ones)
publicClient.interceptors.request.use((config) => {
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(new RegExp('(^| )csrftoken=([^;]+)'));
    if (match && match[2]) {
      config.headers['X-CSRFToken'] = match[2];
    }
  }
  return config;
});

// Helper function to retry API calls with exponential backoff
const retryAPICall = async (apiCall, maxRetries = 2) => {
  let retries = 0;
  while (retries <= maxRetries) {
    try {
      return await apiCall();
    } catch (error) {
      const isLastAttempt = retries === maxRetries;
      if (isLastAttempt) {
        throw error;
      }
      
      // Wait with exponential backoff: 500ms, then 1000ms, then 2000ms...
      const delay = Math.pow(2, retries) * 500;
      await new Promise(resolve => setTimeout(resolve, delay));
      retries++;
      console.log(`Retrying API call, attempt ${retries} of ${maxRetries}`);
    }
  }
};

// Skills API functions
const skillsService = {
  // Get all skills - use public client with retry for better availability
  async getSkills(params = {}, forcedRefresh = false) {
    try {
      // Log the full API URL for debugging
      const fullUrl = `${API_URL}/skills/`;
      console.log('Fetching skills from URL:', fullUrl);
      console.log('API_URL is:', API_URL);
      
      // Add cache busting parameter if forced refresh is requested
      const requestParams = forcedRefresh ? 
        { ...params, _t: new Date().getTime() } : 
        params;
      
      // Common request options to ensure CORS works properly
      // Be careful with headers that might trigger CORS preflight
      const requestOptions = {
        params: requestParams,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          // Only include cache-control headers if explicitly allowed by the server
          ...(forcedRefresh ? {
            // These headers might cause CORS issues if not explicitly allowed on the server
            // 'Cache-Control': 'no-cache, no-store, must-revalidate',
            // 'Pragma': 'no-cache',
            // 'Expires': '0'
          } : {})
        },
        // Explicitly set mode to cors to ensure proper CORS handling
        mode: 'cors' as RequestMode
      };
      
      // First try with authenticated client
      try {
        console.log('Attempting authenticated request to:', fullUrl);
        const response = await apiClient.get('/skills/', requestOptions);
        console.log('Skills response (authenticated):', response.data);
        
        // Extract the results array from the paginated response
        if (response.data && response.data.results && Array.isArray(response.data.results)) {
          console.log(`Extracted ${response.data.results.length} skills from paginated response`);
          return response.data.results;
        }
        
        // If response is already an array, return it directly
        if (Array.isArray(response.data)) {
          console.log(`Received ${response.data.length} skills as direct array`);
          return response.data;
        }
        
        // If we can't determine the structure, log and return an empty array
        console.warn('Unexpected response structure:', response.data);
        return [];
      } catch (authError) {
        console.warn('Authenticated skills fetch failed, trying public client:', authError);
        
        // Check for common connection errors
        if (authError.code === 'ECONNREFUSED') {
          console.error('Connection refused - backend server might not be running on the expected port');
          throw new Error('Connection refused: Backend server not available. Is the Django server running on port 8000?');
        }
        
        // Check for CORS issues
        if (authError.message?.includes('CORS') || (authError.response && authError.response.status === 0)) {
          console.error('CORS error detected:', authError);
          
          // If it's a header-related CORS issue, try again without the problematic headers
          if (authError.message?.includes('header') || authError.message?.includes('Header')) {
            console.log('Attempting request without cache-control headers...');
            try {
              const simpleResponse = await apiClient.get('/skills/', {
                params: requestParams,
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
                }
              });
              console.log('Simple request worked:', simpleResponse.data);
              
              // Extract the results array from the paginated response
              if (simpleResponse.data && simpleResponse.data.results && Array.isArray(simpleResponse.data.results)) {
                console.log(`Extracted ${simpleResponse.data.results.length} skills from paginated response`);
                return simpleResponse.data.results;
              }
              
              // If response is already an array, return it directly
              if (Array.isArray(simpleResponse.data)) {
                console.log(`Received ${simpleResponse.data.length} skills as direct array`);
                return simpleResponse.data;
              }
              
              return simpleResponse.data;
            } catch (simpleError) {
              console.error('Simple request also failed:', simpleError);
            }
          }
          
          // Try with a special no-cors mode using fetch directly
          console.log('Attempting direct fetch with no-cors as fallback...');
          try {
            const directResponse = await fetch(`${API_URL}/skills/`, { 
              method: 'GET',
              mode: 'cors',
              credentials: 'omit',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            });
            if (!directResponse.ok) {
              throw new Error(`Direct fetch failed with status: ${directResponse.status}`);
            }
            const data = await directResponse.json();
            console.log('Direct fetch worked:', data);
            
            // Extract the results array from the paginated response
            if (data && data.results && Array.isArray(data.results)) {
              console.log(`Extracted ${data.results.length} skills from paginated response`);
              return data.results;
            }
            
            // If data is already an array, return it directly
            if (Array.isArray(data)) {
              console.log(`Received ${data.length} skills as direct array`);
              return data;
            }
            
            return data;
          } catch (fetchError) {
            console.error('Direct fetch also failed:', fetchError);
            throw new Error('CORS issue detected. The API is running but browser security is blocking access. Check server CORS configuration.');
          }
        }
        
        // Fall back to public client
        console.log('Attempting public client request to:', fullUrl);
        const response = await retryAPICall(() => 
          publicClient.get('/skills/', requestOptions)
        );
        console.log('Skills response (public):', response.data);
        
        // Extract the results array from the paginated response
        if (response.data && response.data.results && Array.isArray(response.data.results)) {
          console.log(`Extracted ${response.data.results.length} skills from paginated response`);
          return response.data.results;
        }
        
        // If response is already an array, return it directly
        if (Array.isArray(response.data)) {
          console.log(`Received ${response.data.length} skills as direct array`);
          return response.data;
        }
        
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching skills after retries:', error);
      
      // Special handling for network errors that might be port-related
      if (error.code === 'ECONNREFUSED' || error.message?.includes('Connection refused')) {
        throw new Error('Failed to connect to the backend server. Check if Django is running on port 8000.');
      }
      
      // Handle CORS issues
      if (error.message?.includes('CORS') || error.message?.includes('Cross-Origin') || 
          error.message?.includes('Missing Allow Header') || error.message?.includes('header')) {
        throw new Error('Cross-origin request blocked. The server needs the following CORS configuration:\n' +
          '1. CORS_ALLOW_ALL_ORIGINS = True\n' +
          '2. Add your frontend URL to CORS_ALLOWED_ORIGINS\n' +
          '3. Include proper CORS_ALLOW_HEADERS with "cache-control", "pragma", and "expires"\n' +
          '4. Include proper CORS_EXPOSE_HEADERS');
      }
      
      throw new Error('Failed to load skills. Please try again later.');
    }
  },

  // Get all skill categories - use public client with retry
  async getCategories() {
    try {
      console.log('Fetching skill categories...');
      // First try with authenticated client
      try {
        const response = await apiClient.get('/skills/categories/');
        console.log('Categories response (authenticated):', response.data);
        
        // Extract the results array from the paginated response
        if (response.data && response.data.results && Array.isArray(response.data.results)) {
          console.log(`Extracted ${response.data.results.length} categories from paginated response`);
          return response.data.results;
        }
        
        // If response is already an array, return it directly
        if (Array.isArray(response.data)) {
          console.log(`Received ${response.data.length} categories as direct array`);
          return response.data;
        }
        
        // If we can't determine the structure, log and return an empty array
        console.warn('Unexpected categories response structure:', response.data);
        return [];
      } catch (authError) {
        console.warn('Authenticated categories fetch failed, trying public client:', authError);
        
        // Fall back to public client
        const response = await retryAPICall(() => 
          publicClient.get('/skills/categories/')
        );
        console.log('Categories response (public):', response.data);
        
        // Extract the results array from the paginated response
        if (response.data && response.data.results && Array.isArray(response.data.results)) {
          console.log(`Extracted ${response.data.results.length} categories from paginated response`);
          return response.data.results;
        }
        
        // If response is already an array, return it directly
        if (Array.isArray(response.data)) {
          console.log(`Received ${response.data.length} categories as direct array`);
          return response.data;
        }
        
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching skill categories after retries:', error);
      throw new Error('Failed to load skill categories. Please try again later.');
    }
  },

  // Get a single skill by ID
  async getSkill(id: string) {
    try {
      console.log(`Fetching skill ${id}...`);
      const response = await retryAPICall(() => 
        publicClient.get(`/skills/${id}/`)
      );
      console.log('Skill response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching skill ${id}:`, error);
      throw new Error(`Failed to load skill details. Please try again later.`);
    }
  },

  // Create a new skill - always use authenticated client
  async createSkill(skill: Omit<Skill, 'id'>) {
    try {
      // Create a copy of the skill data without tags
      const { tags, ...skillData } = skill;
      
      console.log('Creating skill with data:', skillData);
      
      const response = await apiClient.post('/skills/', skillData);
      console.log('Skill created:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating skill:', error);
      
      // Check for specific error types
      if (error.response) {
        // Handle authentication errors specifically
        if (error.response.status === 401) {
          if (error.response.data?.detail === "Invalid token.") {
            console.error('Authentication failed due to invalid token');
            throw new Error("Authentication failed: Your session may have expired. Please log out and log back in.");
          }
          throw new Error("Authentication required: Please log in to create skills.");
        }
        
        // Handle other specific error types
        if (error.response.status === 400) {
          throw new Error(`Failed to create skill: ${JSON.stringify(error.response.data)}`);
        }
      }
      
      // Fall back to generic error handling
      if (error.message && typeof error.message === 'string') {
        throw new Error(`Failed to create skill: ${error.message}`);
      }
      
      throw new Error('Failed to create skill. Please try again later.');
    }
  },

  // Update an existing skill - always use authenticated client
  async updateSkill(id: string, skill: Partial<Skill>) {
    try {
      // Create a copy of the skill data without tags
      const { tags, ...skillData } = skill;
      
      console.log(`Updating skill ${id} with data:`, skillData);
      
      const response = await apiClient.put(`/skills/${id}/`, skillData);
      console.log('Skill updated:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating skill ${id}:`, error);
      if (error.response && error.response.data) {
        throw new Error(`Failed to update skill: ${JSON.stringify(error.response.data)}`);
      }
      throw new Error('Failed to update skill. Please try again later.');
    }
  },

  // Delete a skill - always use authenticated client
  async deleteSkill(id: string) {
    try {
      console.log(`Deleting skill ${id}...`);
      await apiClient.delete(`/skills/${id}/`);
      console.log(`Skill ${id} deleted`);
      return true;
    } catch (error) {
      console.error(`Error deleting skill ${id}:`, error);
      throw new Error('Failed to delete skill. Please try again later.');
    }
  },

  // Filter skills - use public client with retry
  getSkillsByCategory: async (categoryId: string): Promise<Skill[]> => {
    try {
      console.log(`Fetching skills by category ${categoryId}...`);
      const response = await retryAPICall(() => 
        publicClient.get(`/skills/?category=${categoryId}`)
      );
      console.log('Skills by category response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching skills by category ${categoryId}:`, error);
      throw new Error('Failed to load skills for this category. Please try again later.');
    }
  },

  getSkillsByDifficulty: async (difficulty: Skill['difficulty']): Promise<Skill[]> => {
    try {
      console.log(`Fetching skills by difficulty ${difficulty}...`);
      const response = await retryAPICall(() => 
        publicClient.get(`/skills/?difficulty=${difficulty}`)
      );
      console.log('Skills by difficulty response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching skills by difficulty ${difficulty}:`, error);
      throw new Error('Failed to load skills for this difficulty level. Please try again later.');
    }
  },

  searchSkills: async (searchTerm: string): Promise<Skill[]> => {
    try {
      console.log(`Searching skills with term "${searchTerm}"...`);
      const response = await retryAPICall(() => 
        publicClient.get(`/skills/?search=${searchTerm}`)
      );
      console.log('Search skills response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error searching skills with term "${searchTerm}":`, error);
      throw new Error('Failed to search skills. Please try again later.');
    }
  },

  // Get skills grouped by difficulty - use public client with retry
  getSkillsByDifficultyGrouped: async (): Promise<Record<Skill['difficulty'], Skill[]>> => {
    try {
      console.log('Fetching skills grouped by difficulty...');
      const response = await retryAPICall(() => 
        publicClient.get('/skills/by_difficulty/')
      );
      console.log('Skills by difficulty grouped response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching skills grouped by difficulty:', error);
      throw new Error('Failed to load skills grouped by difficulty. Please try again later.');
    }
  },

  // Get all unique tags - use public client with retry
  getAllTags: async (): Promise<string[]> => {
    try {
      console.log('Fetching all tags...');
      const response = await retryAPICall(() => 
        publicClient.get('/skills/tags/')
      );
      console.log('Tags response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching tags:', error);
      throw new Error('Failed to load tags. Please try again later.');
    }
  },

  // Get a single category by ID - use public client with retry
  async getCategory(id: string) {
    try {
      console.log(`Fetching category ${id}...`);
      const response = await retryAPICall(() => 
        publicClient.get(`/skills/categories/${id}/`)
      );
      console.log('Category response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching category ${id}:`, error);
      throw new Error('Failed to load category details. Please try again later.');
    }
  },

  // Create a new category - always use authenticated client
  async createCategory(category: Omit<SkillCategory, 'id'>) {
    try {
      console.log('Creating category:', category);
      const response = await apiClient.post('/skills/categories/', category);
      console.log('Category created:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      if (error.response && error.response.data) {
        throw new Error(`Failed to create category: ${JSON.stringify(error.response.data)}`);
      }
      throw new Error('Failed to create category. Please try again later.');
    }
  },

  // Update an existing category - always use authenticated client
  async updateCategory(id: string, category: Partial<SkillCategory>) {
    try {
      console.log(`Updating category ${id}:`, category);
      const response = await apiClient.put(`/skills/categories/${id}/`, category);
      console.log('Category updated:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating category ${id}:`, error);
      if (error.response && error.response.data) {
        throw new Error(`Failed to update category: ${JSON.stringify(error.response.data)}`);
      }
      throw new Error('Failed to update category. Please try again later.');
    }
  },

  // Delete a category - always use authenticated client
  async deleteCategory(id: string) {
    try {
      console.log(`Deleting category ${id}...`);
      await apiClient.delete(`/skills/categories/${id}/`);
      console.log(`Category ${id} deleted`);
      return true;
    } catch (error) {
      console.error(`Error deleting category ${id}:`, error);
      throw new Error('Failed to delete category. Please try again later.');
    }
  },

  // Get skills for a specific category - use public client with retry
  getSkillsForCategory: async (categoryId: string): Promise<Skill[]> => {
    try {
      console.log(`Fetching skills for category ${categoryId}...`);
      const response = await retryAPICall(() => 
        publicClient.get(`/skills/categories/${categoryId}/skills/`)
      );
      console.log('Skills for category response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching skills for category ${categoryId}:`, error);
      throw new Error('Failed to load skills for this category. Please try again later.');
    }
  },
};

export default skillsService; 