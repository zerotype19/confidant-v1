import { SignInButtons } from '@/components/auth/SignInButtons';

export function OnboardingWelcome() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Welcome to Confidant</h1>
          <p className="mt-3 text-lg text-gray-600">
            Your trusted companion in parenting
          </p>
        </div>
        <div className="mt-8">
          <SignInButtons />
        </div>
      </div>
    </div>
  );
} 