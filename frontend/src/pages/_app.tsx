import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { AuthProvider } from '../contexts/AuthContext';
import ProtectedRoute from '../components/auth/ProtectedRoute';

// List of routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/skills',
  '/assessments',
  '/candidates',
  '/settings',
];

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    router.pathname === route || router.pathname.startsWith(`${route}/`)
  );

  return (
    <AuthProvider>
      {isProtectedRoute ? (
        <ProtectedRoute>
          <Component {...pageProps} />
        </ProtectedRoute>
      ) : (
        <Component {...pageProps} />
      )}
    </AuthProvider>
  );
} 