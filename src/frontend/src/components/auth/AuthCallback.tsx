import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('Auth error:', error);
      navigate('/signin?error=' + encodeURIComponent(error));
      return;
    }

    if (code) {
      // The code will be handled by the backend
      window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google/callback?code=${code}`;
    } else {
      navigate('/signin');
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
    </div>
  );
} 