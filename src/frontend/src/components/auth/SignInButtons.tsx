import { Button } from '@chakra-ui/react';
import { FaGoogle } from 'react-icons/fa';
import { useToast } from '@chakra-ui/react';
import { API_URL } from '../../config';

export function SignInButtons() {
  const toast = useToast();

  const handleGoogleSignIn = async () => {
    try {
      window.location.href = `${API_URL}/api/auth/google`;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to sign in with Google",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Button
      variant="outline"
      leftIcon={<FaGoogle />}
      onClick={handleGoogleSignIn}
      w="full"
      colorScheme="gray"
    >
      Sign in with Google
    </Button>
  );
} 