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
      console.log('Checking authentication...');
      try {
        const response = await apiRequest('/auth/validate');
        console.log('Auth validation response:', response);
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
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" color="primary.600" thickness="4px" />
      </Box>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
} 