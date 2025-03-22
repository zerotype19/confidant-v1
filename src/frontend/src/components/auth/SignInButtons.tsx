import { Button } from '@/components/ui/button';
import { FaGoogle } from 'react-icons/fa';

export function SignInButtons() {
  const handleGoogleSignIn = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
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