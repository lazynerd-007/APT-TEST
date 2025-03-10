import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import authService from '../services/authService';

interface User {
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  updatePassword: (email: string, newPassword: string) => Promise<boolean>;
}

// Demo user credentials - in a real app, this would be in the backend
interface UserCredentials {
  email: string;
  password: string;
  name: string;
  role: string;
}

// Initialize with default users
const DEMO_USERS: UserCredentials[] = [
  {
    email: 'babsodunewu@gmail.com',
    password: '@Olalekan1',
    name: 'Admin User',
    role: 'admin'
  },
  {
    email: 'admin@example.com',
    password: 'admin123',
    name: 'System Admin',
    role: 'admin'
  },
  {
    email: 'employer@bluapt.com',
    password: 'employer123',
    name: 'Employer User',
    role: 'employer'
  }
];

// Safe localStorage access
const getLocalStorage = () => {
  if (typeof window !== 'undefined') {
    return window.localStorage;
  }
  // Return a mock localStorage for SSR
  return {
    getItem: () => null,
    setItem: () => null,
    removeItem: () => null
  };
};

// Store users in localStorage to persist between page refreshes
const initializeUsers = () => {
  const storage = getLocalStorage();
  const storedUsers = storage.getItem('demo_users');
  if (!storedUsers) {
    storage.setItem('demo_users', JSON.stringify(DEMO_USERS));
    return DEMO_USERS;
  }
  return JSON.parse(storedUsers);
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => false,
  logout: () => {},
  loading: true,
  updatePassword: async () => false,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserCredentials[]>([]);
  const router = useRouter();

  // Initialize users after component mounts (client-side only)
  useEffect(() => {
    setUsers(initializeUsers());
  }, []);

  useEffect(() => {
    // Check if user is logged in on initial load
    const checkAuth = () => {
      try {
        const storage = getLocalStorage();
        const authData = storage.getItem('bluapt_auth');
        if (authData) {
          const { isAuthenticated, user } = JSON.parse(authData);
          if (isAuthenticated && user) {
            setUser(user);
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        // Clear potentially corrupted auth data
        getLocalStorage().removeItem('bluapt_auth');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      // Use the auth service to login
      const { token, user } = await authService.login(email, password);
      
      // Store auth info in localStorage
      getLocalStorage().setItem('bluapt_auth', JSON.stringify({
        isAuthenticated: true,
        user,
        token
      }));
      
      setUser(user);
      
      // Test authentication
      try {
        await authService.testAuth();
        console.log('Authentication test passed');
      } catch (error) {
        console.error('Authentication test failed:', error);
        // Continue anyway for development purposes
      }
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (email: string, newPassword: string): Promise<boolean> => {
    try {
      // Find the user
      const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (userIndex === -1) {
        return false;
      }
      
      // Update the password
      const updatedUsers = [...users];
      updatedUsers[userIndex] = {
        ...updatedUsers[userIndex],
        password: newPassword
      };
      
      // Save to state and localStorage
      setUsers(updatedUsers);
      getLocalStorage().setItem('demo_users', JSON.stringify(updatedUsers));
      
      console.log(`Password updated for ${email}`);
      return true;
    } catch (error) {
      console.error('Error updating password:', error);
      return false;
    }
  };

  const logout = () => {
    getLocalStorage().removeItem('bluapt_auth');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        loading,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 