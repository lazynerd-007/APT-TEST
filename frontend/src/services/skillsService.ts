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
  tags: string[];
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
  tags: string[];
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

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const authData = localStorage.getItem('bluapt_auth');
  if (authData) {
    try {
      const { token } = JSON.parse(authData);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error parsing auth data:', error);
    }
  }
  return config;
});

// Skills API functions
export const skillsService = {
  // Get all skills
  async getSkills(params = {}) {
    try {
      const response = await api.get('/skills/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching skills:', error);
      throw error;
    }
  },

  // Get a single skill by ID
  async getSkill(id: string) {
    try {
      const response = await api.get(`/skills/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching skill ${id}:`, error);
      throw error;
    }
  },

  // Create a new skill
  async createSkill(skill: Omit<Skill, 'id'>) {
    try {
      const response = await api.post('/skills/', skill);
      return response.data;
    } catch (error) {
      console.error('Error creating skill:', error);
      throw error;
    }
  },

  // Update an existing skill
  async updateSkill(id: string, skill: Partial<Skill>) {
    try {
      const response = await api.put(`/skills/${id}/`, skill);
      return response.data;
    } catch (error) {
      console.error(`Error updating skill ${id}:`, error);
      throw error;
    }
  },

  // Delete a skill
  async deleteSkill(id: string) {
    try {
      await api.delete(`/skills/${id}/`);
      return true;
    } catch (error) {
      console.error(`Error deleting skill ${id}:`, error);
      throw error;
    }
  },

  // Filter skills
  getSkillsByCategory: async (categoryId: string): Promise<Skill[]> => {
    const response = await api.get(`/skills/?category=${categoryId}`);
    return response.data;
  },

  getSkillsByDifficulty: async (difficulty: Skill['difficulty']): Promise<Skill[]> => {
    const response = await api.get(`/skills/?difficulty=${difficulty}`);
    return response.data;
  },

  searchSkills: async (searchTerm: string): Promise<Skill[]> => {
    const response = await api.get(`/skills/?search=${searchTerm}`);
    return response.data;
  },

  // Get skills grouped by difficulty
  getSkillsByDifficultyGrouped: async (): Promise<Record<Skill['difficulty'], Skill[]>> => {
    const response = await api.get('/skills/by_difficulty/');
    return response.data;
  },

  // Get all unique tags
  getAllTags: async (): Promise<string[]> => {
    const response = await api.get('/skills/tags/');
    return response.data;
  },

  // Get all skill categories
  async getCategories() {
    try {
      const response = await api.get('/skills/categories/');
      return response.data;
    } catch (error) {
      console.error('Error fetching skill categories:', error);
      throw error;
    }
  },

  // Get a single category by ID
  async getCategory(id: string) {
    try {
      const response = await api.get(`/skills/categories/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching category ${id}:`, error);
      throw error;
    }
  },

  // Create a new category
  async createCategory(category: Omit<SkillCategory, 'id'>) {
    try {
      const response = await api.post('/skills/categories/', category);
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  // Update an existing category
  async updateCategory(id: string, category: Partial<SkillCategory>) {
    try {
      const response = await api.put(`/skills/categories/${id}/`, category);
      return response.data;
    } catch (error) {
      console.error(`Error updating category ${id}:`, error);
      throw error;
    }
  },

  // Delete a category
  async deleteCategory(id: string) {
    try {
      await api.delete(`/skills/categories/${id}/`);
      return true;
    } catch (error) {
      console.error(`Error deleting category ${id}:`, error);
      throw error;
    }
  },

  // Get skills for a specific category
  getSkillsForCategory: async (categoryId: string): Promise<Skill[]> => {
    const response = await api.get(`/skills/categories/${categoryId}/skills/`);
    return response.data;
  },
};

export default skillsService; 