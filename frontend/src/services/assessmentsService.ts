import axios from 'axios';
import { API_URL } from '../config';

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
    const response = await axios.get(`${API_URL}/api/assessments/`, { params });
    return response.data;
  },

  getAssessment: async (id: string) => {
    const response = await axios.get(`${API_URL}/api/assessments/${id}/`);
    return response.data;
  },

  createAssessment: async (assessment: AssessmentCreateUpdate) => {
    const response = await axios.post(`${API_URL}/api/assessments/`, assessment);
    return response.data;
  },

  updateAssessment: async (id: string, assessment: AssessmentCreateUpdate) => {
    const response = await axios.put(`${API_URL}/api/assessments/${id}/`, assessment);
    return response.data;
  },

  deleteAssessment: async (id: string) => {
    await axios.delete(`${API_URL}/api/assessments/${id}/`);
  },

  // Assessment Skills
  getAssessmentSkills: async (assessmentId: string) => {
    const response = await axios.get(`${API_URL}/api/assessments/${assessmentId}/skills/`);
    return response.data;
  },

  addSkillToAssessment: async (assessmentId: string, skillId: string, importance: string = 'secondary') => {
    const response = await axios.post(`${API_URL}/api/assessments/${assessmentId}/add_skill/`, {
      skill_id: skillId,
      importance
    });
    return response.data;
  },

  removeSkillFromAssessment: async (assessmentId: string, skillId: string) => {
    await axios.delete(`${API_URL}/api/assessments/${assessmentId}/remove_skill/`, {
      data: { skill_id: skillId }
    });
  },

  // Tests
  getTests: async (params?: any) => {
    const response = await axios.get(`${API_URL}/api/tests/`, { params });
    return response.data;
  },

  getTest: async (id: string) => {
    const response = await axios.get(`${API_URL}/api/tests/${id}/`);
    return response.data;
  },

  createTest: async (test: any) => {
    const response = await axios.post(`${API_URL}/api/tests/`, test);
    return response.data;
  },

  updateTest: async (id: string, test: any) => {
    const response = await axios.put(`${API_URL}/api/tests/${id}/`, test);
    return response.data;
  },

  deleteTest: async (id: string) => {
    await axios.delete(`${API_URL}/api/tests/${id}/`);
  },

  // Questions
  getQuestions: async (params?: any) => {
    const response = await axios.get(`${API_URL}/api/questions/`, { params });
    return response.data;
  },

  getTestQuestions: async (testId: string) => {
    const response = await axios.get(`${API_URL}/api/tests/${testId}/questions/`);
    return response.data;
  },

  // Candidate Assessments
  getCandidateAssessments: async (params?: any) => {
    const response = await axios.get(`${API_URL}/api/candidate-assessments/`, { params });
    return response.data;
  },

  getCandidateAssessment: async (id: string) => {
    const response = await axios.get(`${API_URL}/api/candidate-assessments/${id}/`);
    return response.data;
  },

  // Candidate Tests
  getCandidateTests: async (candidateAssessmentId: string) => {
    const response = await axios.get(`${API_URL}/api/candidate-assessments/${candidateAssessmentId}/tests/`);
    return response.data;
  },

  // Skill Scores
  getCandidateSkillScores: async (candidateAssessmentId: string) => {
    const response = await axios.get(`${API_URL}/api/candidate-assessments/${candidateAssessmentId}/skill_scores/`);
    return response.data;
  },

  // Filter assessments by skill
  getAssessmentsBySkill: async (skillId: string) => {
    const response = await axios.get(`${API_URL}/api/assessments/`, {
      params: { skill_id: skillId }
    });
    return response.data;
  },

  // Filter tests by skill
  getTestsBySkill: async (skillId: string) => {
    const response = await axios.get(`${API_URL}/api/tests/`, {
      params: { skill_id: skillId }
    });
    return response.data;
  }
};

export default assessmentsService; 