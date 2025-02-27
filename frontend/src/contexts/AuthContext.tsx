import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';

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
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => false,
  logout: () => {},
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in on initial load
    const checkAuth = () => {
      try {
        const authData = localStorage.getItem('bluapt_auth');
        if (authData) {
          const { isAuthenticated, user } = JSON.parse(authData);
          if (isAuthenticated && user) {
            setUser(user);
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        // Clear potentially corrupted auth data
        localStorage.removeItem('bluapt_auth');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      // In a real app, this would be an API call
      // For now, we'll just check against hardcoded credentials
      if (email === 'babsodunewu@gmail.com' && password === '@Olalekan1') {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const userData = {
          email: 'babsodunewu@gmail.com',
          name: 'Admin User',
          role: 'admin'
        };
        
        // Store auth info in localStorage
        localStorage.setItem('bluapt_auth', JSON.stringify({
          isAuthenticated: true,
          user: userData,
          // In a real app, this would be a JWT token
          token: 'mock-jwt-token'
        }));
        
        setUser(userData);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('bluapt_auth');
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 