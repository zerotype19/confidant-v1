import { ReactNode, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

interface SessionGuardProps {
  children: ReactNode
}

export default function SessionGuard({ children }: SessionGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Validate session using the auth cookie
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/validate`, {
          credentials: 'include' // This is important for sending cookies
        });

        if (!response.ok) {
          throw new Error('Invalid session');
        }

        setIsAuthenticated(true);
      } catch (err) {
        console.error('Auth error:', err);
        setIsAuthenticated(false);
        navigate('/signin', { state: { from: location.pathname } });
      }
    };

    checkAuth();
  }, [navigate, location]);

  if (isAuthenticated === null) {
    // Show loading state while checking authentication
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
} 