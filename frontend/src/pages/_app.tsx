import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { useEffect } from 'react';
import { setUpdatePasswordFunction } from '../services/authService';

// List of routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/skills',
  '/assessments',
  '/candidates',
  '/settings',
];

// Wrapper component to connect AuthContext with authService
function AppWithAuth({ Component, pageProps }: AppProps) {
  const { updatePassword } = useAuth();
  const router = useRouter();

  // Connect the updatePassword function from AuthContext to authService
  useEffect(() => {
    setUpdatePasswordFunction(updatePassword);
  }, [updatePassword]);

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    router.pathname === route || router.pathname.startsWith(`${route}/`)
  );

  return (
    <>
      {isProtectedRoute ? (
        <ProtectedRoute>
          <Component {...pageProps} />
        </ProtectedRoute>
      ) : (
        <Component {...pageProps} />
      )}
    </>
  );
}

export default function App(props: AppProps) {
  return (
    <AuthProvider>
      <AppWithAuth {...props} />
    </AuthProvider>
  );
} 