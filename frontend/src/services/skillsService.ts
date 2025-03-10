import axios from 'axios';
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

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create a public API client that doesn't require authentication
const publicApiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const authData = localStorage.getItem('bluapt_auth');
  if (authData) {
    try {
      const { token } = JSON.parse(authData);
      if (token && config.headers) {
        config.headers.Authorization = `Token ${token}`;
      }
    } catch (error) {
      console.error('Error parsing auth data:', error);
    }
  }
  return config;
});

// Skills API functions
const skillsService = {
  // Get all skills
  async getSkills(params = {}) {
    try {
      console.log('Fetching skills...');
      const response = await publicApiClient.get('/skills/', { params });
      console.log('Skills response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching skills:', error);
      throw error;
    }
  },

  // Get a single skill by ID
  async getSkill(id: string) {
    try {
      console.log(`Fetching skill ${id}...`);
      const response = await publicApiClient.get(`/skills/${id}/`);
      console.log('Skill response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching skill ${id}:`, error);
      throw error;
    }
  },

  // Create a new skill
  async createSkill(skill: Omit<Skill, 'id'>) {
    try {
      // Create a copy of the skill data without tags
      const { tags, ...skillData } = skill;
      
      console.log('Creating skill with data:', skillData);
      
      const response = await publicApiClient.post('/skills/', skillData);
      console.log('Skill created:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating skill:', error);
      throw error;
    }
  },

  // Update an existing skill
  async updateSkill(id: string, skill: Partial<Skill>) {
    try {
      // Create a copy of the skill data without tags
      const { tags, ...skillData } = skill;
      
      console.log(`Updating skill ${id} with data:`, skillData);
      
      const response = await publicApiClient.put(`/skills/${id}/`, skillData);
      console.log('Skill updated:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating skill ${id}:`, error);
      throw error;
    }
  },

  // Delete a skill
  async deleteSkill(id: string) {
    try {
      console.log(`Deleting skill ${id}...`);
      await publicApiClient.delete(`/skills/${id}/`);
      console.log(`Skill ${id} deleted`);
      return true;
    } catch (error) {
      console.error(`Error deleting skill ${id}:`, error);
      throw error;
    }
  },

  // Filter skills
  getSkillsByCategory: async (categoryId: string): Promise<Skill[]> => {
    console.log(`Fetching skills by category ${categoryId}...`);
    const response = await publicApiClient.get(`/skills/?category=${categoryId}`);
    console.log('Skills by category response:', response.data);
    return response.data;
  },

  getSkillsByDifficulty: async (difficulty: Skill['difficulty']): Promise<Skill[]> => {
    console.log(`Fetching skills by difficulty ${difficulty}...`);
    const response = await publicApiClient.get(`/skills/?difficulty=${difficulty}`);
    console.log('Skills by difficulty response:', response.data);
    return response.data;
  },

  searchSkills: async (searchTerm: string): Promise<Skill[]> => {
    console.log(`Searching skills with term "${searchTerm}"...`);
    const response = await publicApiClient.get(`/skills/?search=${searchTerm}`);
    console.log('Search skills response:', response.data);
    return response.data;
  },

  // Get skills grouped by difficulty
  getSkillsByDifficultyGrouped: async (): Promise<Record<Skill['difficulty'], Skill[]>> => {
    console.log('Fetching skills grouped by difficulty...');
    const response = await publicApiClient.get('/skills/by_difficulty/');
    console.log('Skills by difficulty grouped response:', response.data);
    return response.data;
  },

  // Get all unique tags
  getAllTags: async (): Promise<string[]> => {
    console.log('Fetching all tags...');
    const response = await publicApiClient.get('/skills/tags/');
    console.log('Tags response:', response.data);
    return response.data;
  },

  // Get all skill categories
  async getCategories() {
    try {
      console.log('Fetching skill categories...');
      const response = await publicApiClient.get('/skills/categories/');
      console.log('Categories response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching skill categories:', error);
      throw error;
    }
  },

  // Get a single category by ID
  async getCategory(id: string) {
    try {
      console.log(`Fetching category ${id}...`);
      const response = await publicApiClient.get(`/skills/categories/${id}/`);
      console.log('Category response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching category ${id}:`, error);
      throw error;
    }
  },

  // Create a new category
  async createCategory(category: Omit<SkillCategory, 'id'>) {
    try {
      console.log('Creating category:', category);
      const response = await publicApiClient.post('/skills/categories/', category);
      console.log('Category created:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  // Update an existing category
  async updateCategory(id: string, category: Partial<SkillCategory>) {
    try {
      console.log(`Updating category ${id}:`, category);
      const response = await publicApiClient.put(`/skills/categories/${id}/`, category);
      console.log('Category updated:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating category ${id}:`, error);
      throw error;
    }
  },

  // Delete a category
  async deleteCategory(id: string) {
    try {
      console.log(`Deleting category ${id}...`);
      await publicApiClient.delete(`/skills/categories/${id}/`);
      console.log(`Category ${id} deleted`);
      return true;
    } catch (error) {
      console.error(`Error deleting category ${id}:`, error);
      throw error;
    }
  },

  // Get skills for a specific category
  getSkillsForCategory: async (categoryId: string): Promise<Skill[]> => {
    console.log(`Fetching skills for category ${categoryId}...`);
    const response = await publicApiClient.get(`/skills/categories/${categoryId}/skills/`);
    console.log('Skills for category response:', response.data);
    return response.data;
  },
};

export default skillsService; 