import axios from 'axios';
import apiClient from './apiClient';
import { API_URL, API_BASE_URL } from '../config';

// Create a separate axios instance for public endpoints
const publicApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

export interface CandidateInvite {
  name: string;
  email: string;
}

export interface InviteRequest {
  assessment_id: string;
  candidates: CandidateInvite[];
  message?: string;
}

export interface InviteResponse {
  message: string;
  success_count: number;
  failed_count: number;
  failed: Array<{
    email: string;
    name: string;
    reason: string;
  }>;
}

const candidateService = {
  /**
   * Invite candidates to take an assessment
   * @param data The invitation data
   * @returns Promise with the invitation results
   */
  inviteCandidates: async (data: InviteRequest): Promise<InviteResponse> => {
    try {
      const response = await publicApiClient.post(
        `/api/v1/users/invite_candidates/`, 
        data,
        {
          headers: {
            'X-Postmark-API-Key': '6be4158a-6496-4d18-bedf-ecac1e65b9bc'
          }
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('Error inviting candidates:', error.response.data);
        throw new Error(error.response.data.error || 'Failed to invite candidates');
      }
      throw new Error('Network error occurred');
    }
  },

  /**
   * Get all candidates
   * @returns Promise with the list of candidates
   */
  getCandidates: async () => {
    try {
      const response = await apiClient.get(`/users?is_candidate=true`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.error || 'Failed to fetch candidates');
      }
      throw new Error('Network error occurred');
    }
  },

  /**
   * Get a candidate by ID
   * @param id The candidate ID
   * @returns Promise with the candidate data
   */
  getCandidateById: async (id: string) => {
    try {
      const response = await apiClient.get(`/users/${id}/`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.error || 'Failed to fetch candidate');
      }
      throw new Error('Network error occurred');
    }
  },

  /**
   * Verify candidate access code
   * @param email The candidate email
   * @param accessCode The access code
   * @returns Promise with the verification result
   */
  verifyAccessCode: async (email: string, accessCode: string) => {
    try {
      const response = await publicApiClient.post(`/api/v1/users/verify_access_code/`, {
        email,
        access_code: accessCode
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('Error verifying access code:', error.response.data);
        throw new Error(error.response.data.error || 'Invalid email or access code');
      }
      throw new Error('Network error occurred');
    }
  }
};

export default candidateService; 