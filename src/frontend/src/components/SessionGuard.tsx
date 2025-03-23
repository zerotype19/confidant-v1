import { ReactNode, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Box, Spinner } from '@chakra-ui/react'
import { apiRequest } from '../utils/api'

interface SessionGuardProps {
  children: ReactNode
}

export default function SessionGuard({ children }: SessionGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const checkAuth = async () => {
      console.log('SessionGuard: Starting authentication check...');
      console.log('SessionGuard: API URL:', import.meta.env.VITE_API_URL);
      try {
        console.log('SessionGuard: Making request to /auth/validate');
        const response = await apiRequest('/auth/validate');
        console.log('SessionGuard: Auth validation response:', response);
        setIsAuthenticated(true);
      } catch (err) {
        console.error('SessionGuard: Authentication error:', err);
        console.error('SessionGuard: Error details:', {
          message: err instanceof Error ? err.message : 'Unknown error',
          stack: err instanceof Error ? err.stack : undefined
        });
        setIsAuthenticated(false);
        navigate('/signin', { state: { from: location.pathname } });
      }
    };

    checkAuth();
  }, [navigate, location]);

  if (isAuthenticated === null) {
    console.log('SessionGuard: Showing loading state');
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" color="primary.600" thickness="4px" />
      </Box>
    );
  }

  console.log('SessionGuard: Authentication state:', isAuthenticated);
  return isAuthenticated ? <>{children}</> : null;
} 