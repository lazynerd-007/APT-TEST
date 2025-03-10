import axios from 'axios';
import apiClient from './apiClient';
import { API_URL } from '../config';

const API_ENDPOINT = `${API_URL}/auth`;

// Simulated database of valid users
const VALID_USERS = [
  'admin@example.com',
  'babsodunewu@gmail.com',
  'employer@bluapt.com'
];

// Store the updatePassword function when it's provided
let updatePasswordFn: ((email: string, newPassword: string) => Promise<boolean>) | null = null;

// Function to set the updatePassword function from AuthContext
export const setUpdatePasswordFunction = (fn: (email: string, newPassword: string) => Promise<boolean>) => {
  updatePasswordFn = fn;
};

// Safe access to window object
const getWindow = () => {
  return typeof window !== 'undefined' ? window : null;
};

const authService = {
  /**
   * Login with email and password
   * @param email The user's email
   * @param password The user's password
   * @returns Promise with the login result
   */
  login: async (email: string, password: string): Promise<{ token: string; user: any }> => {
    try {
      // For development purposes, we'll simulate a successful login
      // In production, this would call the backend API
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if it's a valid user email (for demo purposes)
      if (VALID_USERS.includes(email.toLowerCase())) {
        console.log(`Login successful for ${email}`);
        
        // Use a token format that will be accepted by DevelopmentAuthentication
        const token = 'dev-token-' + Math.random().toString(36).substring(2, 15);
        
        // Return user info
        return {
          token,
          user: {
            email,
            name: email.split('@')[0],
            role: email.includes('admin') ? 'admin' : 'employer'
          }
        };
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  /**
   * Request a password reset email
   * @param email The user's email address
   * @returns Promise with the request result
   */
  requestPasswordReset: async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      // In a real implementation, this would call the backend API
      // For demo purposes, we'll simulate a successful response
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if it's a valid user email (for demo purposes)
      if (VALID_USERS.includes(email.toLowerCase())) {
        console.log(`Password reset requested for ${email}. In a real app, an email would be sent.`);
        
        // In a real implementation, this would send an actual email
        // For demo purposes, we'll just log the reset link to the console
        const resetToken = Buffer.from(email + Date.now()).toString('base64');
        const win = getWindow();
        const resetLink = win ? `${win.location.origin}/reset-password?token=${resetToken}` : `/reset-password?token=${resetToken}`;
        
        console.log('Reset link:', resetLink);
        console.log('Please use this link to reset your password (demo only)');
        
        return {
          success: true,
          message: 'If your email exists in our system, you will receive password reset instructions shortly. Please check your email and spam folder.'
        };
      } else {
        // For security reasons, don't reveal that the email doesn't exist
        console.log(`Password reset requested for non-existent user: ${email}`);
        
        return {
          success: true, // Still return success for security
          message: 'If your email exists in our system, you will receive password reset instructions shortly. Please check your email and spam folder.'
        };
      }
      
      // Real implementation would be:
      // const response = await apiClient.post(`/auth/reset-password/request`, { email });
      // return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.error || 'Failed to request password reset');
      }
      throw new Error('Network error occurred');
    }
  },

  /**
   * Reset password with token
   * @param token The reset token from the email
   * @param newPassword The new password
   * @returns Promise with the reset result
   */
  resetPassword: async (token: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    try {
      // In a real implementation, this would call the backend API
      // For demo purposes, we'll simulate a successful response
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Decode the token to get the email (in a real app, this would be more secure)
      try {
        const decodedData = Buffer.from(token, 'base64').toString();
        const email = decodedData.split(new RegExp('[0-9]'))[0]; // Extract email part
        
        // Verify the email is valid
        if (VALID_USERS.includes(email.toLowerCase())) {
          // Update the password using the function from AuthContext
          if (updatePasswordFn) {
            const updated = await updatePasswordFn(email, newPassword);
            
            if (updated) {
              return {
                success: true,
                message: 'Password has been successfully reset. You can now log in with your new password.'
              };
            } else {
              return {
                success: false,
                message: 'Failed to update password. Please try again.'
              };
            }
          } else {
            console.error('updatePasswordFn is not set');
            return {
              success: false,
              message: 'System error: Password update function not available.'
            };
          }
        } else {
          return {
            success: false,
            message: 'Invalid or expired token'
          };
        }
      } catch (e) {
        return {
          success: false,
          message: 'Invalid or expired token'
        };
      }
      
      // Real implementation would be:
      // const response = await apiClient.post(`/auth/reset-password/confirm`, { token, new_password: newPassword });
      // return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.error || 'Failed to reset password');
      }
      throw new Error('Network error occurred');
    }
  },

  /**
   * Test authentication
   * @returns Promise with the test result
   */
  testAuth: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/users/test_auth/');
      console.log('Authentication test successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Authentication test failed:', error);
      throw error;
    }
  }
};

export default authService; 