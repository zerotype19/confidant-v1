import { ChakraProvider } from '@chakra-ui/react';
import { AuthProvider } from './contexts/auth-context';
import AppRoutes from './AppRoutes';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChildProvider } from './contexts/ChildContext';
import { theme } from './theme';

const queryClient = new QueryClient();

export function App() {
  return (
    <ChakraProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ChildProvider>
            <Router>
              <AppRoutes />
            </Router>
          </ChildProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ChakraProvider>
  );
} 