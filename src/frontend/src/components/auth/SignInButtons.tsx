import { Button } from '@/components/ui/button';
import { FaGoogle } from 'react-icons/fa';
import { useToast } from '@/hooks/use-toast';

export function SignInButtons() {
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    try {
      window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to sign in with Google",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Button
        variant="outline"
        className="flex items-center gap-2"
        onClick={handleGoogleSignIn}
      >
        <FaGoogle className="h-5 w-5" />
        Sign in with Google
      </Button>
    </div>
  );
} 