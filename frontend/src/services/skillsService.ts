import axios from 'axios';

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

// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Create axios instance with auth headers
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Skills API service
const skillsService = {
  // Skills
  getSkills: async (): Promise<Skill[]> => {
    const response = await api.get('/skills/');
    return response.data;
  },

  getSkillById: async (id: string): Promise<Skill> => {
    const response = await api.get(`/skills/${id}/`);
    return response.data;
  },

  createSkill: async (skillData: SkillCreateData): Promise<Skill> => {
    const response = await api.post('/skills/', skillData);
    return response.data;
  },

  updateSkill: async (id: string, skillData: Partial<SkillCreateData>): Promise<Skill> => {
    const response = await api.patch(`/skills/${id}/`, skillData);
    return response.data;
  },

  deleteSkill: async (id: string): Promise<void> => {
    await api.delete(`/skills/${id}/`);
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

  // Categories
  getCategories: async (): Promise<SkillCategory[]> => {
    const response = await api.get('/skills/categories/');
    return response.data;
  },

  getCategoryById: async (id: string): Promise<SkillCategory> => {
    const response = await api.get(`/skills/categories/${id}/`);
    return response.data;
  },

  createCategory: async (categoryData: SkillCategoryCreateData): Promise<SkillCategory> => {
    const response = await api.post('/skills/categories/', categoryData);
    return response.data;
  },

  updateCategory: async (id: string, categoryData: Partial<SkillCategoryCreateData>): Promise<SkillCategory> => {
    const response = await api.patch(`/skills/categories/${id}/`, categoryData);
    return response.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await api.delete(`/skills/categories/${id}/`);
  },

  // Get skills for a specific category
  getSkillsForCategory: async (categoryId: string): Promise<Skill[]> => {
    const response = await api.get(`/skills/categories/${categoryId}/skills/`);
    return response.data;
  },
};

export default skillsService; 