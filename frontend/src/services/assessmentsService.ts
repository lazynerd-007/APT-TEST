import axios from 'axios';
import apiClient from './apiClient';
import { API_URL, API_BASE_URL } from '../config';

// Create a separate axios instance for public endpoints
const publicApiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Types
export interface Skill {
  id: string;
  name: string;
  description: string;
  category: {
    id: string;
    name: string;
  };
  difficulty: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface AssessmentSkill {
  id: string;
  assessment: string;
  skill: string;
  skill_details: Skill;
  importance: 'primary' | 'secondary' | 'tertiary';
  created_at: string;
}

export interface Test {
  id: string;
  title: string;
  description: string;
  instructions: string;
  time_limit: number | null;
  category: string;
  difficulty: string;
  created_by: string;
  organization: string;
  skills: Skill[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AssessmentTest {
  id: string;
  assessment: string;
  test: string;
  test_details: Test;
  weight: number;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  time_limit: number;
  passing_score: number;
  created_by: string;
  organization: string;
  skills: Skill[];
  assessment_skills: AssessmentSkill[];
  assessment_tests: AssessmentTest[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AssessmentCreateUpdate {
  title: string;
  description: string;
  time_limit: number;
  passing_score: number;
  created_by: string;
  organization: string;
  skill_data?: {
    skill_id: string;
    importance?: 'primary' | 'secondary' | 'tertiary';
  }[];
  test_data?: {
    test_id: string;
    weight?: number;
    order?: number;
  }[];
  is_active: boolean;
}

export interface Question {
  id: string;
  test: string;
  title: string;
  description: string;
  question_type: 'multiple_choice' | 'coding' | 'free_text' | 'file_upload';
  points: number;
  order: number;
  skills: Skill[];
  created_at: string;
  updated_at: string;
}

export interface CandidateTest {
  id: string;
  candidate_assessment: string;
  test: string;
  test_details: Test;
  status: 'not_started' | 'in_progress' | 'completed';
  score: number | null;
  start_time: string | null;
  end_time: string | null;
  created_at: string;
  updated_at: string;
}

export interface CandidateAssessment {
  id: string;
  candidate: string;
  assessment: string;
  assessment_details: Assessment;
  status: 'not_started' | 'in_progress' | 'completed' | 'expired';
  score: number | null;
  start_time: string | null;
  end_time: string | null;
  candidate_tests: CandidateTest[];
  created_at: string;
  updated_at: string;
}

export interface CandidateSkillScore {
  id: string;
  candidate: string;
  skill: string;
  skill_details: Skill;
  assessment: string;
  score: number;
  created_at: string;
  updated_at: string;
}

// API Service
const assessmentsService = {
  // Assessments
  getAssessments: async (params?: any) => {
    try {
      console.log('Calling getAssessments with params:', params);
      // Use publicApiClient for development purposes
      const response = await publicApiClient.get('/assessments/assessments/', { params });
      console.log('Assessment API response:', response);
      // Return the results array from the paginated response
      return response.data.results || [];
    } catch (error) {
      console.error('Error in getAssessments:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('API error response:', error.response.data);
      }
      throw error;
    }
  },

  getAssessment: async (id: string) => {
    const response = await apiClient.get(`/assessments/assessments/${id}/`);
    return response.data;
  },

  createAssessment: async (assessment: AssessmentCreateUpdate) => {
    const response = await apiClient.post(`/assessments/assessments/`, assessment);
    return response.data;
  },

  updateAssessment: async (id: string, assessment: AssessmentCreateUpdate) => {
    const response = await apiClient.put(`/assessments/assessments/${id}/`, assessment);
    return response.data;
  },

  deleteAssessment: async (id: string) => {
    await apiClient.delete(`/assessments/assessments/${id}/`);
  },

  // Assessment Skills
  getAssessmentSkills: async (assessmentId: string) => {
    const response = await apiClient.get(`/assessments/assessments/${assessmentId}/skills/`);
    return response.data;
  },

  addSkillToAssessment: async (assessmentId: string, skillId: string, importance: string = 'secondary') => {
    const response = await apiClient.post(`/assessments/assessments/${assessmentId}/add_skill/`, {
      skill_id: skillId,
      importance
    });
    return response.data;
  },

  removeSkillFromAssessment: async (assessmentId: string, skillId: string) => {
    await apiClient.delete(`/assessments/assessments/${assessmentId}/remove_skill/`, {
      data: { skill_id: skillId }
    });
  },

  // Tests
  getTests: async (params?: any) => {
    try {
      const response = await apiClient.get(`/assessments/tests/`, { params });
      
      // Ensure we return an array of tests with id and title properties
      const testsData = response.data;
      
      // If the response is already an array, return it
      if (Array.isArray(testsData)) {
        return testsData;
      }
      
      // If the response has a results property (paginated response), return that
      if (testsData.results && Array.isArray(testsData.results)) {
        return testsData.results;
      }
      
      // Otherwise, return an empty array
      console.warn('Unexpected response format from tests API:', testsData);
      return [];
    } catch (error) {
      console.error('Error fetching tests:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('API error response:', error.response.data);
      }
      throw error;
    }
  },

  getTest: async (id: string) => {
    const response = await apiClient.get(`/assessments/tests/${id}/`);
    return response.data;
  },

  createTest: async (test: any) => {
    const response = await apiClient.post(`/assessments/tests/`, test);
    return response.data;
  },

  updateTest: async (id: string, test: any) => {
    const response = await apiClient.put(`/assessments/tests/${id}/`, test);
    return response.data;
  },

  deleteTest: async (id: string) => {
    await apiClient.delete(`/assessments/tests/${id}/`);
  },

  // Questions
  getQuestions: async (params?: any) => {
    const response = await apiClient.get(`/assessments/questions/`, { params });
    return response.data;
  },

  getQuestion: async (id: string) => {
    const response = await apiClient.get(`/assessments/questions/${id}/`);
    return response.data;
  },

  createQuestion: async (question: any) => {
    const response = await apiClient.post(`/assessments/questions/`, question);
    return response.data;
  },

  updateQuestion: async (id: string, question: any) => {
    const response = await apiClient.put(`/assessments/questions/${id}/`, question);
    return response.data;
  },

  deleteQuestion: async (id: string) => {
    await apiClient.delete(`/assessments/questions/${id}/`);
  },

  uploadQuestionsCSV: async (file: File, testId: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('test_id', testId);
    
    const response = await apiClient.post('/assessments/questions/import_csv/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  exportQuestionsCSV: async (testId: string): Promise<void> => {
    try {
      const response = await apiClient.get(`/assessments/questions/tests/${testId}/export_questions/`, {
        responseType: 'blob'
      });
      
      // Create a download link and trigger the download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `test_questions_${testId}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting questions:', error);
      throw error;
    }
  },

  getTestQuestions: async (testId: string) => {
    const response = await apiClient.get(`/assessments/tests/${testId}/questions/`);
    return response.data;
  },

  // Candidate Assessments
  getCandidateAssessments: async (params?: any) => {
    const response = await apiClient.get(`/assessments/candidate-assessments/`, { params });
    return response.data;
  },

  getCandidateAssessment: async (id: string) => {
    const response = await apiClient.get(`/assessments/candidate-assessments/${id}/`);
    return response.data;
  },

  createCandidateAssessment: async (candidateAssessment: any) => {
    const response = await apiClient.post(`/assessments/candidate-assessments/`, candidateAssessment);
    return response.data;
  },

  updateCandidateAssessment: async (id: string, candidateAssessment: any) => {
    const response = await apiClient.put(`/assessments/candidate-assessments/${id}/`, candidateAssessment);
    return response.data;
  },

  deleteCandidateAssessment: async (id: string) => {
    await apiClient.delete(`/assessments/candidate-assessments/${id}/`);
  },

  getCandidateAssessmentTests: async (candidateAssessmentId: string) => {
    const response = await apiClient.get(`/assessments/candidate-assessments/${candidateAssessmentId}/tests/`);
    return response.data;
  },

  getCandidateAssessmentSkillScores: async (candidateAssessmentId: string) => {
    const response = await apiClient.get(`/assessments/candidate-assessments/${candidateAssessmentId}/skill_scores/`);
    return response.data;
  },

  // Filter assessments by skill
  getAssessmentsBySkill: async (skillId: string) => {
    const response = await apiClient.get(`/assessments/`, {
      params: { skill_id: skillId }
    });
    return response.data;
  },

  // Filter tests by skill
  getTestsBySkill: async (skillId: string) => {
    const response = await apiClient.get(`/tests/`, {
      params: { skill_id: skillId }
    });
    return response.data;
  },

  // Get assessments for inviting candidates
  getAssessmentsForInvite: async () => {
    try {
      console.log('Fetching assessments for invite...');
      // Use publicApiClient for this endpoint to avoid authentication issues
      const response = await publicApiClient.get('/assessments/', {
        params: { is_active: true }
      });
      console.log('Assessment API response:', response);
      return response.data;
    } catch (error) {
      console.error('Error fetching assessments for invite:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('API error response:', error.response.data);
      }
      throw error;
    }
  },

  // Candidate Tests
  getCandidateTests: async (params?: any) => {
    const response = await apiClient.get(`/assessments/candidate-tests/`, { params });
    return response.data;
  },

  getCandidateTest: async (id: string): Promise<CandidateTest> => {
    const response = await apiClient.get(`/assessments/candidate-tests/${id}/`);
    return response.data;
  },

  updateCandidateTest: async (id: string, data: Partial<CandidateTest>): Promise<CandidateTest> => {
    const response = await apiClient.patch(`/assessments/candidate-tests/${id}/`, data);
    return response.data;
  },

  submitAnswer: async (candidateTestId: string, questionId: string, data: any): Promise<any> => {
    const response = await apiClient.post(`/assessments/candidate-tests/${candidateTestId}/answers/`, {
      question_id: questionId,
      ...data
    });
    return response.data;
  },

  getAnswers: async (candidateTestId: string): Promise<any[]> => {
    const response = await apiClient.get(`/assessments/candidate-tests/${candidateTestId}/answers/`);
    return response.data;
  },

  // Skill Scores
  getSkillScores: async (params?: any) => {
    const response = await apiClient.get(`/assessments/skill-scores/`, { params });
    return response.data;
  },

  getSkillScore: async (id: string) => {
    const response = await apiClient.get(`/assessments/skill-scores/${id}/`);
    return response.data;
  },

  reorderQuestions: async (testId: string, questionIds: string[]) => {
    try {
      const response = await apiClient.post(`/assessments/tests/${testId}/reorder_questions/`, {
        question_ids: questionIds
      });
      return response.data;
    } catch (error) {
      console.error('Error reordering questions:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('API error response:', error.response.data);
      }
      throw error;
    }
  }
};

export default assessmentsService; 