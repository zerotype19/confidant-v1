import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import { ChildProvider } from './contexts/ChildContext';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider value={defaultSystem}>
        <ChildProvider>
          <Router>
            <AppRoutes />
          </Router>
        </ChildProvider>
      </ChakraProvider>
    </QueryClientProvider>
  );
}

export default App; 