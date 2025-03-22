import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import OnboardingProgress from './OnboardingProgress';

// API URL is configured via VITE_API_URL environment variable in Cloudflare Pages
const familySchema = z.object({
  name: z.string().min(1, 'Family name is required'),
});

type FamilyFormData = z.infer<typeof familySchema>;

export default function ParentSetupForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FamilyFormData>({
    resolver: zodResolver(familySchema),
  });

  const onSubmit = async (data: FamilyFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Making request to:', `${import.meta.env.VITE_API_URL}/api/onboarding/family`);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/onboarding/family`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.error || `Failed to create family (${response.status})`);
      }

      const result = await response.json();
      console.log('Family created:', result);
      navigate('/onboarding/child');
    } catch (error) {
      console.error('Error creating family:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Family Setup
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Let's create your family profile
        </p>
      </div>

      <OnboardingProgress />

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Family Name
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  type="text"
                  {...register('name')}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., The Smith Family"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate('/onboarding/welcome')}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                disabled={isLoading}
              >
                Back
              </button>
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Continue'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 