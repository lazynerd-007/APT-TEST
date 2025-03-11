import axios from 'axios';
import authService from './authService';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('authService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Clear localStorage
    localStorage.clear();
  });
  
  describe('loginUser', () => {
    it('should login a user successfully', async () => {
      // Mock the response
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        role: 'candidate',
        token: 'test-token'
      };
      
      mockedAxios.post.mockResolvedValueOnce({ data: mockUser });
      
      // Call the method
      const result = await authService.loginUser({
        email: 'test@example.com',
        password: 'password'
      });
      
      // Check that axios was called correctly
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login/'),
        { email: 'test@example.com', password: 'password' }
      );
      
      // Check that the result is correct
      expect(result).toEqual(mockUser);
      
      // Check that the user was stored in localStorage
      expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser));
    });
    
    it('should throw an error if login fails', async () => {
      // Mock the error
      const mockError = new Error('Invalid credentials');
      mockedAxios.post.mockRejectedValueOnce(mockError);
      
      // Call the method and expect it to throw
      await expect(authService.loginUser({
        email: 'test@example.com',
        password: 'wrong-password'
      })).rejects.toThrow();
      
      // Check that axios was called correctly
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login/'),
        { email: 'test@example.com', password: 'wrong-password' }
      );
      
      // Check that nothing was stored in localStorage
      expect(localStorage.getItem('user')).toBeNull();
    });
  });
  
  describe('loginAsDemo', () => {
    it('should login as demo user successfully', async () => {
      // Mock the response
      const mockUser = {
        id: '123',
        email: 'demo.candidate@example.com',
        first_name: 'Demo',
        last_name: 'Candidate',
        role: 'candidate',
        token: 'demo-token'
      };
      
      mockedAxios.post.mockResolvedValueOnce({ data: mockUser });
      
      // Call the method
      const result = await authService.loginAsDemo();
      
      // Check that axios was called correctly
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login/'),
        { email: 'demo.candidate@example.com', password: 'demopassword' }
      );
      
      // Check that the result is correct
      expect(result).toEqual(mockUser);
      
      // Check that the user was stored in localStorage
      expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser));
    });
    
    it('should create demo user if login fails', async () => {
      // Mock the responses
      const mockError = new Error('Invalid credentials');
      const mockCreateResponse = { data: { id: '123' } };
      const mockUser = {
        id: '123',
        email: 'demo.candidate@example.com',
        first_name: 'Demo',
        last_name: 'Candidate',
        role: 'candidate',
        token: 'demo-token'
      };
      
      // First login attempt fails
      mockedAxios.post.mockRejectedValueOnce(mockError);
      // Create demo user succeeds
      mockedAxios.post.mockResolvedValueOnce({ data: mockCreateResponse });
      // Second login attempt succeeds
      mockedAxios.post.mockResolvedValueOnce({ data: mockUser });
      
      // Call the method
      const result = await authService.loginAsDemo();
      
      // Check that axios was called correctly
      expect(mockedAxios.post).toHaveBeenCalledTimes(3);
      expect(mockedAxios.post).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining('/auth/login/'),
        { email: 'demo.candidate@example.com', password: 'demopassword' }
      );
      expect(mockedAxios.post).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('/users/create_demo_user/')
      );
      expect(mockedAxios.post).toHaveBeenNthCalledWith(
        3,
        expect.stringContaining('/auth/login/'),
        { email: 'demo.candidate@example.com', password: 'demopassword' }
      );
      
      // Check that the result is correct
      expect(result).toEqual(mockUser);
      
      // Check that the user was stored in localStorage
      expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser));
    });
  });
  
  describe('logout', () => {
    it('should remove user from localStorage', () => {
      // Set up localStorage
      localStorage.setItem('user', JSON.stringify({ id: '123' }));
      
      // Call the method
      authService.logout();
      
      // Check that localStorage was cleared
      expect(localStorage.getItem('user')).toBeNull();
    });
  });
  
  describe('getCurrentUser', () => {
    it('should return user from localStorage', () => {
      // Set up localStorage
      const mockUser = { id: '123', email: 'test@example.com' };
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      // Call the method
      const result = authService.getCurrentUser();
      
      // Check that the result is correct
      expect(result).toEqual(mockUser);
    });
    
    it('should return null if no user in localStorage', () => {
      // Call the method
      const result = authService.getCurrentUser();
      
      // Check that the result is correct
      expect(result).toBeNull();
    });
  });
}); 